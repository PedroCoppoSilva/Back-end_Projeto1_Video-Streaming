const { connectDB, client } = require('./db');
const Usuario = require('./usuario'); 
const Video = require('./video');
const Comentario = require('./comentario');
const logger = require('./logger_custom');

async function executarTestes() {
    let db;
    let novoUsuarioId;
    let novoVideoId;

    try {
        db = await connectDB(); 
        const usuarioDAO = new Usuario(db); 
        const videoDAO = new Video(db);
        const comentarioDAO = new Comentario(db);
        console.log("\n--- INICIANDO TESTES DE INTEGRAÇÃO ---");        

        const dadosUsuario = { nome: "Alice Channel", email: "alice@canal.com", senha: "senha_do_canal" };
        novoUsuarioId = await usuarioDAO.inserirUsuario(dadosUsuario);
        console.log(`SUCESSO: Usuário cadastrado. ID: ${novoUsuarioId}`);
        

        const dadosVideo = {
            titulo: "Meu Primeiro Vlog",
            descricao: "Um vídeo sobre como programar um back-end!",
            url: "https://youtube.com/vlog1",
            idUsuario: novoUsuarioId 
        };
        novoVideoId = await videoDAO.inserirVideo(dadosVideo);
        console.log(`SUCESSO: Vídeo upado. ID: ${novoVideoId}`);

        const dadosComentario = {
            texto: "Ótimo tutorial!",
            idUsuario: novoUsuarioId, 
            idVideo: novoVideoId 
        };
        const novoComentarioId = await comentarioDAO.inserirComentario(dadosComentario);
        console.log(`SUCESSO: Comentário publicado. ID: ${novoComentarioId}`);

        const usuarioEncontrado = await usuarioDAO.buscarUsuario({ _id: novoUsuarioId });
        console.log(`\nBUSCA USUÁRIO: Encontrado: ${usuarioEncontrado.nome} (Email: ${usuarioEncontrado.email})`);

        const videosBusca = await videoDAO.buscarVideosPorPalavraChave("programar");
        console.log(`BUSCA VÍDEO: Encontrado ${videosBusca.length} vídeo(s) com a palavra 'programar'.`);

        const comentariosBusca = await comentarioDAO.buscarComentariosPorVideo(novoVideoId);
        console.log(`BUSCA COMENTÁRIO: Encontrado ${comentariosBusca.length} comentário(s) no vídeo.`);

        console.log("\n--- TESTANDO VALIDAÇÕES DE ERRO (DEVE FALHAR E GERAR LOG) ---");

        try {
            await videoDAO.inserirVideo({ url: "fail.com", idUsuario: novoUsuarioId });
            console.log("FALHA: Validação de Vídeo falhou, inseriu sem título.");
        } catch (error) {
            console.log(`SUCESSO DE ERRO: Vídeo falhou (Motivo: ${error.message}). VERIFIQUE O ARQUIVO 'erros.log'.`);
        }

        try {
            await usuarioDAO.deletarUsuario({ nome: "sem email" });
            console.log("FALHA: Validação de Deleção de Usuário falhou, tentou deletar sem email.");
        } catch (error) {
            console.log(`SUCESSO DE ERRO: Deleção de Usuário falhou (Motivo: ${error.message}).`);
        }
        
        console.log("\n--- EXECUTANDO TESTES DE DELEÇÃO ---");
        
        const deletados = await usuarioDAO.deletarUsuario({ email: "alice@canal.com" });
        console.log(`✅ SUCESSO: Foram deletados ${deletados} usuário(s) (Alice).`);
        
    } catch (e) {
        logger.error("ERRO FATAL NO SISTEMA:", { mensagem: e.message, stack: e.stack });
        console.error("\nERRO FATAL NA EXECUÇÃO DO TESTE:", e.message);
    } finally {
        if (client) {
            await client.close();
            console.log("\n--- TESTES CONCLUÍDOS. Conexão com o MongoDB fechada. ---");
        }
    }
}

executarTestes();