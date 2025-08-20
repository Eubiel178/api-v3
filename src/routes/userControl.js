const { Router } = require("express");
const UserModel = require("../models/user.model");
const ReminderModel = require("../models/reminder.model");
const SubscriptionModel = require("../models/subscription.model");

const router = Router();

router.post("/users", async (request, response) => {
  try {
    const { email, password, password_confirmation } = request.body;

    const allUser = await UserModel.find();

    const checkAlreadyExists = allUser.filter((element) => {
      if (element.email === email) {
        return element;
      }
    });

    if (checkAlreadyExists.length > 0) {
      response.status(400).json({
        status: "ERROR",
        errorMessage: "Esse email já está cadastrado",
      });
    } else if (password === password_confirmation) {
      const { body } = request;
      await UserModel.create(body);

      response.status(200).json({ status: "OK", data: body });
    } else {
      response.status(400).json({
        status: "ERROR",
        errorMessage:
          "As senhas não são iguais, por favor verifique e tente novamente",
      });
    }
  } catch (error) {
    response.status(500).json({ status: "ERROR", error: error.msg });
  }
});

router.post("/authenticate", async (request, response) => {
  // console.log(request);

  try {
    const { body } = request;
    const user = await UserModel.find(body);

    if (user.length > 0) {
      response.status(200).json({ data: { ...user[0] }, status: "OK" });
    } else {
      response
        .status(400)
        .json({ status: "ERROR", errorMessage: "Email ou Senha incorretos" });
    }
  } catch (error) {
    response.status(500).json({ status: "ERROR", errorMessage: error.msg });
  }
});

router.get("/users/:id", async (request, response) => {
  try {
    const user = await UserModel.findById(request.params.id).select(
      "-password -password_confirmation"
    );

    if (user?.name) {
      response.status(200).json({ data: { user }, status: "OK" });
    } else {
      response
        .status(404)
        .json({ status: "ERROR", errorMessage: "Usuário não encontrado" });
    }
  } catch (error) {
    response.status(500).json({ status: "ERROR", errorMessage: error.message });
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
