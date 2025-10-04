// index.js

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
        // 1. CONEXÃO COM O BANCO DE DADOS
        db = await connectDB(); 
        const usuarioDAO = new Usuario(db); 
        const videoDAO = new Video(db);
        const comentarioDAO = new Comentario(db);
        
        console.log("\n--- INICIANDO TESTES DE INTEGRAÇÃO ---");
        
        // =================================================================
        // 2. TESTES DE INSERÇÃO (Sucesso)
        // =================================================================
        
        // 2.1. Inserir Novo Usuário
        const dadosUsuario = { nome: "Alice Channel", email: "alice@canal.com", senha: "senha_do_canal" };
        novoUsuarioId = await usuarioDAO.inserirUsuario(dadosUsuario);
        console.log(`✅ SUCESSO: Usuário cadastrado. ID: ${novoUsuarioId}`);
        
        // 2.2. Inserir Novo Vídeo usando o ID do Usuário
        const dadosVideo = {
            titulo: "Meu Primeiro Vlog",
            descricao: "Um vídeo sobre como programar um back-end!",
            url: "https://youtube.com/vlog1",
            idUsuario: novoUsuarioId // Chave estrangeira!
        };
        novoVideoId = await videoDAO.inserirVideo(dadosVideo);
        console.log(`✅ SUCESSO: Vídeo upado. ID: ${novoVideoId}`);

        // 2.3. Inserir Novo Comentário
        const dadosComentario = {
            texto: "Ótimo tutorial!",
            idUsuario: novoUsuarioId, // Quem comentou
            idVideo: novoVideoId // A qual vídeo pertence
        };
        const novoComentarioId = await comentarioDAO.inserirComentario(dadosComentario);
        console.log(`✅ SUCESSO: Comentário publicado. ID: ${novoComentarioId}`);


        // =================================================================
        // 3. TESTES DE BUSCA
        // =================================================================

        // 3.1. Buscar o Usuário inserido
        const usuarioEncontrado = await usuarioDAO.buscarUsuario({ _id: novoUsuarioId });
        console.log(`\n🔍 BUSCA USUÁRIO: Encontrado: ${usuarioEncontrado.nome} (Email: ${usuarioEncontrado.email})`);

        // 3.2. Buscar Vídeos por Palavra-Chave
        const videosBusca = await videoDAO.buscarVideosPorPalavraChave("programar");
        console.log(`🔍 BUSCA VÍDEO: Encontrado ${videosBusca.length} vídeo(s) com a palavra 'programar'.`);

        // 3.3. Buscar Comentários do Vídeo
        const comentariosBusca = await comentarioDAO.buscarComentariosPorVideo(novoVideoId);
        console.log(`🔍 BUSCA COMENTÁRIO: Encontrado ${comentariosBusca.length} comentário(s) no vídeo.`);


        // =================================================================
        // 4. TESTES DE ERRO (Validando Log e Exceção - REQUISITO DO PROJETO)
        // =================================================================

        console.log("\n--- TESTANDO VALIDAÇÕES DE ERRO (DEVE FALHAR E GERAR LOG) ---");

        // 4.1. Tentar Inserir Vídeo SEM TÍTULO (Obrigatório)
        try {
            await videoDAO.inserirVideo({ url: "fail.com", idUsuario: novoUsuarioId });
            console.log("❌ FALHA: Validação de Vídeo falhou, inseriu sem título.");
        } catch (error) {
            console.log(`✅ SUCESSO DE ERRO: Vídeo falhou (Motivo: ${error.message}). VERIFIQUE O ARQUIVO 'erros.log'.`);
        }

        // 4.2. Tentar Deletar Usuário SEM EMAIL (Obrigatório)
        try {
            await usuarioDAO.deletarUsuario({ nome: "sem email" });
            console.log("❌ FALHA: Validação de Deleção de Usuário falhou, tentou deletar sem email.");
        } catch (error) {
            console.log(`✅ SUCESSO DE ERRO: Deleção de Usuário falhou (Motivo: ${error.message}).`);
        }
        
        // =================================================================
        // 5. TESTE DE DELEÇÃO (Limpeza)
        // =================================================================
        
        console.log("\n--- EXECUTANDO TESTES DE DELEÇÃO ---");
        
        const deletados = await usuarioDAO.deletarUsuario({ email: "alice@canal.com" });
        console.log(`✅ SUCESSO: Foram deletados ${deletados} usuário(s) (Alice).`);

    } catch (e) {
        // Captura qualquer erro não tratado, geralmente erro de conexão fatal
        logger.error("ERRO FATAL NO SISTEMA:", { mensagem: e.message, stack: e.stack });
        console.error("\n❌ ERRO FATAL NA EXECUÇÃO DO TESTE:", e.message);
    } finally {
        // Fecha o cliente MongoDB
        if (client) {
            await client.close();
            console.log("\n--- TESTES CONCLUÍDOS. Conexão com o MongoDB fechada. ---");
        }
    }
}

executarTestes();