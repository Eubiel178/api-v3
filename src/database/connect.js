const mongoose = require("mongoose");

const MONGODB_URI = `mongodb://admin:root@cluster0-shard-00-00.d1a0iys.mongodb.net:27017,cluster0-shard-00-01.d1a0iys.mongodb.net:27017,cluster0-shard-00-02.d1a0iys.mongodb.net:27017/?replicaSet=atlas-xxxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
`;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  console.log("🔌 Conectando ao banco de dados...");

  if (cached.conn) {
    return cached.conn; // Retorna a conexão já existente
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  console.log("✅ Conectado ao banco de dados com sucesso");
  return cached.conn;
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
