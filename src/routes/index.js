require("events").EventEmitter.defaultMaxListeners = 20;

const express = require("express");
const cors = require("cors");
const { config } = require("dotenv");

const connectToDatabase = require("./src/database/connect");
// const ReminderModel = require("./src/models/reminder.model");

const userControl = require("./src/routes/userControl");
const taskControl = require("./src/routes/taskControl");
const reminderControl = require("./src/routes/reminderControl");
// const subscriptionControl = require("./src/routes/subscriptionControl");

config();

const { PORT = 4000, LOCAL_ADDRESS = "0.0.0.0" } = process.env;

const app = express();

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

const webPush = require("web-push");

webPush.setVapidDetails(
  "mailto:dev123gabriel@gmail.com",
  "BHLOs2Z5r8k7u7bmOKqrMfnBQuOWnEc8bI2hJW-vTGHp4aNnNibOftiHa1R62CfoIbjTaaKhlBlNxUj4K54K_-k", // chave pública
  "W8FNlXzA8YP43KqsJk7lzCDmgzbIB7VPb2caDusJqB4" // chave privada
);

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Conecta ao MongoDB
connectToDatabase();

// Rotas
app.use(userControl);
app.use(taskControl);
app.use(reminderControl);
// app.use(subscriptionControl);

// const SubscriptionModel = require("./src/models/subscription.model");
// const cron = require("node-cron");

// roda a cada minuto
// cron.schedule("* * * * *", async () => {
//   console.log("🔔 Checando lembretes do dia...");
//   const hojeStr = new Date().toISOString().slice(0, 10);

//   const lembretes = await ReminderModel.find({
//     remindAt: hojeStr,
//     notificado: false,
//   });

//   for (const lembrete of lembretes) {
//     const sub = await SubscriptionModel.findOne({ userID: lembrete.userID });

//     try {
//       await webPush.sendNotification(
//         sub.subscription,
//         JSON.stringify({
//           title: lembrete?.title || "Lembrete",
//           message: lembrete?.description,
//         })
//       );

//       lembrete.notificado = true;
//       await lembrete.save();
//       console.log(lembrete);
//     } catch (err) {
//       if (err.statusCode === 410 || err.statusCode === 404) {
//         console.log(`Subscription expirada ou removida. Deletando...`);
//         await SubscriptionModel.deleteOne({ userID: lembrete.userID });
//       } else {
//         console.error("Erro ao enviar notificação:", err);
//       }
//     }
//   }
// });

app.listen(PORT, LOCAL_ADDRESS, () => {
  console.log(`🟢 Servidor rodando em http://${LOCAL_ADDRESS}:${PORT}`);
  console.log(`🟢 Servidor rodando em http://localhost:${PORT}`);
});
