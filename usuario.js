// Usuario.js (Versão revisada)
const logger = require('./logger_custom');
const { ObjectId } = require('mongodb'); // Importe para garantir que você possa usar IDs (se precisar)

class Usuario {
    // 1. Recebe a instância do DB no construtor
    constructor(db) {
        // Armazena a referência para a coleção 'usuarios'
        this.collection = db.collection('usuarios');
    }

    // Validação de campos obrigatórios (MUITO IMPORTANTE para o projeto)
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
            // Verifica campos obrigatórios
            this.validate(dados);
            
            // Tenta inserir no MongoDB
            const result = await this.collection.insertOne(dados);
            return result.insertedId; // Retorna o ID gerado

        } catch (error) {
            // Trata e loga a exceção (REQUISITO DO PROJETO)
            logger.error(`Falha ao inserir novo Usuário: ${error.message}`, { 
                dados: JSON.stringify(dados),
                stack: error.stack 
            });
            // Re-lança um erro mais genérico para quem chamou
            throw new Error(`Erro ao cadastrar usuário: ${error.message}`);
        }
    }

    // Implemente os métodos de busca e deleção aqui...
    async buscarUsuario(dados) {
        try {
            // Tenta inserir no MongoDB
            const result = await this.collection.findOne(dados);
            return result; // Retorna o ID gerado

        } catch (error) {
            // Trata e loga a exceção (REQUISITO DO PROJETO)
            logger.error(`Falha ao inserir novo Usuário: ${error.message}`, { 
                dados: JSON.stringify(dados),
                stack: error.stack 
            });
            // Re-lança um erro mais genérico para quem chamou
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
            // Trata e loga a exceção (REQUISITO DO PROJETO)
            logger.error(`Falha ao inserir novo Usuário: ${error.message}`, { 
                dados: JSON.stringify(dados),
                stack: error.stack 
            });
            // Re-lança um erro mais genérico para quem chamou
            throw new Error(`Erro ao cadastrar usuário: ${error.message}`);
        }
    }
}

module.exports = Usuario;