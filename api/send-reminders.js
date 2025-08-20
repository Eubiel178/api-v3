const connectToDatabase = require("./src/database/connect");
const ReminderModel = require("./src/models/reminder.model");
const SubscriptionModel = require("../src/models/subscription.model");
const webPush = require("web-push");

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end(); // só GET para cron

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
}
