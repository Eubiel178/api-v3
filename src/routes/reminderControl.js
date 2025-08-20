const ReminderModel = require("../models/reminder.model");
const { Router } = require("express");
const connectToDatabase = require("../database/connect");

const router = Router();
const SubscriptionModel = require("../models/subscription.model");
const webPush = require("web-push");

router.post("/reminders", async (req, res) => {
  try {
    const { body } = req;

    const reminder = await ReminderModel.create(body);

    return res.status(200).json({ status: "OK", reminder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "ERROR", errorMessage: error.message });
  }
});

router.get("/reminders", async (req, res) => {
  try {
    await connectToDatabase(); // garante conexão antes de qualquer find/create

    // Criar novo lembrete

    // Enviar lembretes do dia
    console.log("🔔 Checando lembretes do dia...");
    const hojeStr = new Date().toISOString().slice(0, 10);

    const lembretes = await ReminderModel.find({
      remindAt: hojeStr,
      notificado: false,
    });

    console.log(lembretes);

    for (const lembrete of lembretes) {
      const sub = await SubscriptionModel.findOne({
        userID: lembrete.userID,
      });
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

    return res.status(200).json({ ok: true, enviados: lembretes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "ERROR", errorMessage: error.message });
  }
});

module.exports = router;
