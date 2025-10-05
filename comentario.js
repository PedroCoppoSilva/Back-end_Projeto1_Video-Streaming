const logger = require('./logger_custom');
const { ObjectId } = require('mongodb'); 

class Comentario {
    
    constructor(db) {
        this.collection = db.collection('comentarios');
    }

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

    async inserirComentario(dados) {
        try {
            this.validate(dados);
            const dadosCompletos = {
                ...dados,
                data: dados.data || new Date()
            };

            const result = await this.collection.insertOne(dadosCompletos);
            return result.insertedId;

        } catch (error) {
            logger.error(`Falha ao inserir novo Comentário: ${error.message}`, { 
                dados: JSON.stringify(dados),
                stack: error.stack 
            });
            throw new Error(`Erro ao publicar comentário: ${error.message}`);
        }
    }

    async buscarComentariosPorVideo(idVideo) {
        try {
            if (!idVideo) {
                throw new Error('idVideo é obrigatório para buscar comentários.');
            }
            const videoId = (typeof idVideo === 'string' && ObjectId.isValid(idVideo)) ? new ObjectId(idVideo) : idVideo;
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
    
    async deletarComentario(idComentario) {
        try {
            if (!idComentario) {
                throw new Error('O idComentario é obrigatório para deletar.');
            }

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