const logger = require('./logger_custom');
const { ObjectId } = require('mongodb'); 

class Comentario {
    
    constructor(db) {
        this.collection = db.collection('comentarios');
    }
    
    // 1. Validação de campos obrigatórios (Requisito do Projeto)
    validate(dados) {
        if (!dados.texto || dados.texto.trim() === '') {
            throw new Error('O campo "texto" é obrigatório.');
        }
        if (!dados.idUsuario) {
            throw new Error('O campo "idUsuario" é obrigatório.');
        }
        if (!dados.idVideo) {
            throw new Error('O campo "idVideo" é obrigatório.');
        }
    }

    // 2. [Inserção - I]: Publica um novo comentário
    async inserirComentario(dados) {
        try {
            this.validate(dados);
            
            // Adiciona data se não for fornecida
            const dadosCompletos = {
                ...dados,
                data: dados.data || new Date()
            };

            const result = await this.collection.insertOne(dadosCompletos);
            return result.insertedId;

        } catch (error) {
            // Tratamento e Log de Exceção (Requisito do Projeto)
            logger.error(`Falha ao inserir novo Comentário: ${error.message}`, { 
                dados: JSON.stringify(dados),
                stack: error.stack 
            });
            throw new Error(`Erro ao publicar comentário: ${error.message}`);
        }
    }

    // 3. [Busca - B]: Busca todos os comentários de um vídeo específico
    async buscarComentariosPorVideo(idVideo) {
        try {
            if (!idVideo) {
                throw new Error('idVideo é obrigatório para buscar comentários.');
            }
            
            // Tenta converter para ObjectId, caso o ID seja uma string
            const videoId = (typeof idVideo === 'string' && ObjectId.isValid(idVideo)) ? new ObjectId(idVideo) : idVideo;
            
            // Busca e ordena os comentários pela data de forma decrescente (mais recentes primeiro)
            const comentarios = await this.collection.find({ idVideo: videoId })
                                                    .sort({ data: -1 })
                                                    .toArray();
            return comentarios;

        } catch (error) {
            logger.error(`Falha ao buscar comentários por idVideo: ${error.message}`, { 
                idVideo: idVideo,
                stack: error.stack 
            });
            throw new Error(`Erro ao carregar comentários: ${error.message}`);
        }
    }
    
    // 4. [Deleção - D]: Deleta um comentário pelo ID
    async deletarComentario(idComentario) {
        try {
            if (!idComentario) {
                throw new Error('O idComentario é obrigatório para deletar.');
            }
            
            // Tenta converter para ObjectId, caso o ID seja uma string
            const comentarioId = (typeof idComentario === 'string' && ObjectId.isValid(idComentario)) ? new ObjectId(idComentario) : idComentario;

            const result = await this.collection.deleteOne({ _id: comentarioId });
            return result.deletedCount;

        } catch (error) {
            logger.error(`Falha ao deletar comentário: ${error.message}`, { 
                idComentario: idComentario,
                stack: error.stack 
            });
            throw new Error(`Erro ao deletar comentário: ${error.message}`);
        }
    }
}

module.exports = Comentario;