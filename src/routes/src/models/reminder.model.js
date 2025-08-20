const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  title: { type: String, required: true, minlength: 1 },
  notificado: { type: Boolean, default: false }, // ✅ Novo campo
  description: { type: String, required: false },
  userID: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  remindAt: { type: Date, required: true },
  color: { type: String, required: false },
});

const ReminderModel = mongoose.model("reminders", reminderSchema);

module.exports = ReminderModel;
