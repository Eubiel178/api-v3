const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  subscription: { type: Object, required: true },
});

module.exports = mongoose.model("subscriptions", subscriptionSchema);
