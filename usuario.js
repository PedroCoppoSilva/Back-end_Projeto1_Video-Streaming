const logger = require('./logger_custom');
const { ObjectId } = require('mongodb');

class Usuario {
    
    constructor(db) {
        this.collection = db.collection('usuarios');
    }
    validate(dados) {
        if (!dados.nome || dados.nome.trim() === '') {
            throw new Error('O campo "nome" é obrigatório.');
        }
        if (!dados.email || dados.email.trim() === '') {
            throw new Error('O campo "email" é obrigatório.');
        }
        if (!dados.senha || dados.senha.trim() === '') {
            throw new Error('O campo "senha" é obrigatório.');
        }
    }

    async inserirUsuario(dados) {
        try {
            
            this.validate(dados);
            
            // Tenta inserir no MongoDB
            const result = await this.collection.insertOne(dados);
            return result.insertedId;

        } catch (error) {
           
            logger.error(`Falha ao inserir novo Usuário: ${error.message}`, { 
                dados: JSON.stringify(dados),
                stack: error.stack 
            });
            
            throw new Error(`Erro ao cadastrar usuário: ${error.message}`);
        }
    }

    async buscarUsuario(dados) {
        try {
            
            const result = await this.collection.findOne(dados);
            return result; 

        } catch (error) {
            
            logger.error(`Falha ao inserir novo Usuário: ${error.message}`, { 
                dados: JSON.stringify(dados),
                stack: error.stack 
            });
            
            throw new Error(`Erro ao cadastrar usuário: ${error.message}`);
        }
    }

    async deletarUsuario(dados) {
        try {
            if (!dados.email || dados.email.trim() === '') {
                 throw new Error('O campo "email" é obrigatório para deletar.');
            }

        const result = await this.collection.deleteMany({ email: dados.email });
        return result.deletedCount; // 1 se deletou, 0 se não achou

        } catch (error) {
            logger.error(`Falha ao inserir novo Usuário: ${error.message}`, { 
                dados: JSON.stringify(dados),
                stack: error.stack 
            });
            throw new Error(`Erro ao cadastrar usuário: ${error.message}`);
        }
    }
}

module.exports = Usuario;