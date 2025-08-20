const ReminderModel = require("../models/reminder.model");
const { Router } = require("express");

const router = Router();
const SubscriptionModel = require("../models/subscription.model");
const webPush = require("web-push");

// Criar novo lembrete
router.post("/reminders", async (req, res) => {
  try {
    const { body } = req;

    const reminder = await ReminderModel.create(body);

    res.status(200).json({ status: "OK", reminder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "ERROR", errorMessage: error.message });
  }
});

router.post("/send-reminders", async (req, res) => {
  try {
    console.log("🔔 Checando lembretes do dia...");
    const hojeStr = new Date().toISOString().slice(0, 10);

    const lembretes = await ReminderModel.find({
      remindAt: hojeStr,
      notificado: false,
    });

    for (const lembrete of lembretes) {
      const sub = await SubscriptionModel.findOne({ userID: lembrete.userID });
      if (!sub) continue;

      try {
        await webPush.sendNotification(
          sub.subscription,
          JSON.stringify({
            title: lembrete?.title || "Lembrete",
            message: lembrete?.description,
          })
        );

        lembrete.notificado = true;
        await lembrete.save();
        console.log("Notificado:", lembrete.title);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`Subscription expirada ou removida. Deletando...`);
          await SubscriptionModel.deleteOne({ userID: lembrete.userID });
        } else {
          console.error("Erro ao enviar notificação:", err);
        }
      }
    }

    res.status(200).json({ ok: true, enviados: lembretes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;

module.exports = router;
