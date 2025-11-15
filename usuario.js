const logger = require('./logger_custom');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

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

            // HASH DA SENHA
            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash(dados.senha, salt);

            const dadosCompletos = {
                ...dados,
                senha: senhaHash // Salva o hash, não a senha original
            };

            const result = await this.collection.insertOne(dadosCompletos);
            return result.insertedId;
            this.validate(dados);

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