const mongoose = require("mongoose");

const MONGODB_URI = `mongodb+srv://admin:root@todolist.d1a0iys.mongodb.net/?retryWrites=true&w=majority&appName=todolist`;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase(retries = 3, delay = 1000) {
  if (cached.conn) {
    return cached.conn; // Retorna a conexão já existente
  }

  const connect = async () => {
    try {
      cached.conn = await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("✅ Conectado ao banco de dados com sucesso");
      return cached.conn;
    } catch (error) {
      console.error(`⚠️ Falha ao conectar ao MongoDB: ${error.message}`);
      if (retries > 0) {
        console.log(`⏳ Tentando novamente em ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
        return connect(retries - 1, delay * 2); // retry exponencial
      } else {
        throw new Error(
          "Não foi possível conectar ao MongoDB após múltiplas tentativas"
        );
      }
    }
  };

  cached.promise = connect();
  return cached.promise;
}

module.exports = connectToDatabase;
// const mongoose = require("mongoose");
// const { MONGODB_USERNAME, MONGODB_PASSWORD } = process.env;

// const connectToDatabase = async () => {
//   await mongoose.connect(
//     `mongodb+srv://admin:root@todolist.d1a0iys.mongodb.net/?retryWrites=true&w=majority&appName=todolist`,
//     (error) => {
//       if (error) {
//         console.log(`falha ao conectar com o banco de dados: ${error}`);
//       } else {
//         console.log("conectado ao banco de dados com sucesso ");
//       }
//     }
//   );
// };

// module.exports = connectToDatabase;
