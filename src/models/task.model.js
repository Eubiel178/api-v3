const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  //

  color: {
    type: String,
    required: false,
  },
  createdAt: {
    required: false,
    type: Date,
    default: Date.now,
  },
  startDate: {
    required: false,
    type: Date,
  },
  endDate: {
    required: false,
    type: String,
  },
  tag: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: true,
    minlength: 1,
  },
  description: {
    type: String,
    required: true,
    minlength: 1,
  },
  isFinished: { type: Boolean, default: false },

  userID: {
    type: String,
    required: true,
  },
  index: {
    type: String,
    required: false,
  },
  key: {
    type: String,
    required: false,
  },

  urgency: {
    type: String,
    required: false,
  },
});

const TaskModel = mongoose.model("tasks", taskSchema);

module.exports = TaskModel;
