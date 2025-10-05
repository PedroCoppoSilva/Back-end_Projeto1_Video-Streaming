const { MongoClient } = require('mongodb');
const uri = "mongodb://localhost:27017"; 
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log("Conectado ao MongoDB com sucesso.");
        
        return client.db("streamingdb");
    } catch (e) {
        require('./logger_custom').error(`Erro ao conectar ao MongoDB: ${e.message}`);
        throw e; 
    }
}

module.exports = { connectDB, client };
