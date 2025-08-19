const ReminderModel = require("../models/reminder.model");
const { Router } = require("express");

const router = Router();

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

module.exports = router;
