const logger = require('./logger_custom');
const { ObjectId } = require('mongodb'); 

class Video {
    
    constructor(db) {
        this.collection = db.collection('videos');
    }
    
    // 1. Validação de campos obrigatórios (Requisito do Projeto)
    validate(dados) {
        if (!dados.titulo || dados.titulo.trim() === '') {
            throw new Error('O campo "titulo" é obrigatório.');
        }
        if (!dados.url || dados.url.trim() === '') {
            throw new Error('O campo "url" é obrigatório.');
        }
        // idUsuario é a chave estrangeira (FK) que liga o vídeo ao criador.
        if (!dados.idUsuario) {
            throw new Error('O campo "idUsuario" (ID do canal/usuário) é obrigatório.');
        }
    }

    // 2. [Inserção - I]: Cadastra um novo vídeo (Upload)
    async inserirVideo(dados) {
        try {
            this.validate(dados);
            
            // Adiciona dataUpload se não for fornecida
            const dadosCompletos = {
                ...dados,
                dataUpload: dados.dataUpload || new Date()
            };

            const result = await this.collection.insertOne(dadosCompletos);
            return result.insertedId;

        } catch (error) {
            // Tratamento e Log de Exceção (Requisito do Projeto)
            logger.error(`Falha ao inserir novo Vídeo: ${error.message}`, { 
                dados: JSON.stringify(dados),
                stack: error.stack 
            });
            throw new Error(`Erro ao enviar vídeo: ${error.message}`);
        }
    }

    // 3. [Busca - B]: Busca vídeos por um termo no título ou descrição
    async buscarVideosPorPalavraChave(termo) {
        try {
            if (!termo || termo.trim() === '') {
                throw new Error('O termo de busca não pode ser vazio.');
            }
            // Usa expressão regular para busca parcial e case-insensitive
            const regex = new RegExp(termo, 'i'); 
            
            const videos = await this.collection.find({
                $or: [
                    { titulo: { $regex: regex } },
                    { descricao: { $regex: regex } }
                ]
            }).toArray();

            return videos;

        } catch (error) {
            logger.error(`Falha ao buscar vídeos por palavra chave: ${error.message}`, { 
                termo: termo,
                stack: error.stack 
            });
            throw new Error(`Erro na busca de vídeos: ${error.message}`);
        }
    }
    
    // 4. [Deleção - D]: Deleta um vídeo pelo ID
    async deletarVideo(idVideo) {
        try {
            if (!idVideo) {
                throw new Error('O idVideo é obrigatório para deletar.');
            }
            
            // Tenta converter para ObjectId, caso o ID seja uma string
            const videoId = (typeof idVideo === 'string' && ObjectId.isValid(idVideo)) ? new ObjectId(idVideo) : idVideo;

            const result = await this.collection.deleteOne({ _id: videoId });
            return result.deletedCount;

        } catch (error) {
            logger.error(`Falha ao deletar vídeo: ${error.message}`, { 
                idVideo: idVideo,
                stack: error.stack 
            });
            throw new Error(`Erro ao deletar vídeo: ${error.message}`);
        }
    }
}

module.exports = Video;