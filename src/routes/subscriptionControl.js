const { Router } = require("express");
const router = Router();
const SubscriptionModel = require("../models/subscription.model");

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
