const ReminderModel = require("../models/reminder.model");
const SubscriptionModel = require("../models/subscription.model");
const { Router } = require("express");

const connectToDatabase = require("../database/connect");
const webPush = require("web-push");

const router = Router();

router.get("/send-reminders", async (req, res) => {
  try {
    await connectToDatabase();

    console.log("🔔 Cron job executando...");

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
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await SubscriptionModel.deleteOne({ userID: lembrete.userID });
        }
      }
    }

    return res.status(200).json({ ok: true, enviados: lembretes.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

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

router.post("/save-subscription", async (req, res) => {
  const { userID, subscription } = req.body;
  if (!userID || !subscription) return res.status(400).send("Dados inválidos");

  try {
    // busca a subscription existente
    const existing = await SubscriptionModel.findOne({ userID });

    // compara as subscriptions
    const isSame =
      existing &&
      JSON.stringify(existing.subscription) === JSON.stringify(subscription);
    console.log(isSame, "issame");

    if (isSame) {
      // já está salva, não precisa atualizar
      console.log("Subscription já existente e válida:", existing);
      return res.send({
        success: true,
        subscription: existing,
        message: "Subscription já válida",
      });
    }

    // se não existir ou for diferente, cria/atualiza
    const saved = await SubscriptionModel.findOneAndUpdate(
      { userID },
      { subscription },
      { upsert: true, new: true }
    );

    console.log("Subscription salva/atualizada:", saved);
    res.send({ success: true, subscription: saved });
  } catch (err) {
    console.error("Erro ao salvar subscription:", err);
    res.status(500).send({ success: false, error: err.message });
  }
});

module.exports = router;

// router.get("/reminders", async (req, res) => {
//   try {
//     await connectToDatabase(); // garante conexão antes de qualquer find/create

//     // Criar novo lembrete

//     // Enviar lembretes do dia
//     console.log("🔔 Checando lembretes do dia...");
//     const hojeStr = new Date().toISOString().slice(0, 10);

//     const lembretes = await ReminderModel.find({
//       remindAt: hojeStr,
//       notificado: false,
//     });

//     console.log(lembretes);

//     for (const lembrete of lembretes) {
//       const sub = await SubscriptionModel.findOne({
//         userID: lembrete.userID,
//       });
//       if (!sub) continue;

//       try {
//         await webPush.sendNotification(
//           sub.subscription,
//           JSON.stringify({
//             title: lembrete?.title || "Lembrete",
//             message: lembrete?.description,
//           })
//         );

//         lembrete.notificado = true;
//         await lembrete.save();
//         console.log("Notificado:", lembrete.title);
//       } catch (err) {
//         if (err.statusCode === 410 || err.statusCode === 404) {
//           console.log(`Subscription expirada ou removida. Deletando...`);
//           await SubscriptionModel.deleteOne({ userID: lembrete.userID });
//         } else {
//           console.error("Erro ao enviar notificação:", err);
//         }
//       }
//     }

//     return res.status(200).json({ ok: true, enviados: lembretes.length });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ status: "ERROR", errorMessage: error.message });
//   }
// });

module.exports = router;
