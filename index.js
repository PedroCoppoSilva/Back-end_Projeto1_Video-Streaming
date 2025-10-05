
const { connectDB, client } = require('./db');
const Usuario = require('./usuario'); 
const Video = require('./video');
const Comentario = require('./comentario');

// Função principal de demonstração
async function demonstrarFuncionalidades() {
    let db;
    let novoUsuarioId;
    let novoVideoId;

    try {
        db = await connectDB(); 
        const usuarioDAO = new Usuario(db); 
        const videoDAO = new Video(db);
        const comentarioDAO = new Comentario(db);

        // 1.1. Inserção de um Novo Usuário
        const dadosUsuario = { nome: "Canal Tech Pro", email: "tech@pro.com", senha: "securePass123" };
        novoUsuarioId = await usuarioDAO.inserirUsuario(dadosUsuario);
        console.log(` -> Usuário 'tech@pro.com' cadastrado com ID: ${novoUsuarioId}`);
        
        // 1.2. Inserção de um Novo Vídeo
        const dadosVideo = {
            titulo: "Node.js com MongoDB: Guia Rápido",
            descricao: "Demonstração de classes de acesso a dados em Node.js.",
            url: "https://youtube.com",
            idUsuario: novoUsuarioId, 
            tempo: "15:30"
        };
        novoVideoId = await videoDAO.inserirVideo(dadosVideo);
        console.log(` -> Vídeo '${dadosVideo.titulo}' upado com sucesso. ID: ${novoVideoId}`);

        // 1.3. Inserção de um Novo Comentário
        const dadosComentario = {
            texto: "Excelente conteúdo, muito claro.",
            idUsuario: novoUsuarioId, 
            idVideo: novoVideoId
        };
        const novoComentarioId = await comentarioDAO.inserirComentario(dadosComentario);
        console.log(` -> Comentário publicado no vídeo. ID: ${novoComentarioId}`);

        // 2.1. Buscar o Usuário inserido por ID
        const usuarioEncontrado = await usuarioDAO.buscarUsuario({ _id: novoUsuarioId });
        console.log(` -> Busca Usuário: Encontrado: ${usuarioEncontrado.nome}`);

        // 2.2. Buscar Vídeos por Palavra-Chave
        const videosBusca = await videoDAO.buscarVideosPorPalavraChave("Guia Rápido");
        console.log(` -> Busca Vídeo: Encontrado ${videosBusca.length} vídeo(s) com a palavra-chave.`);

        // 2.3. Buscar Comentários de um Vídeo
        const comentariosBusca = await comentarioDAO.buscarComentariosPorVideo(novoVideoId);
        console.log(` -> Busca Comentário: Encontrado ${comentariosBusca.length} comentário(s) para o vídeo.`);

        // 3.1. Teste de Falha: Inserir Vídeo SEM TÍTULO
        try {
            console.log(" -> Tentando inserir Vídeo sem Título...");
            await videoDAO.inserirVideo({ url: "fail.com", idUsuario: novoUsuarioId });
            console.log("   [ERRO]: A validação falhou, o vídeo foi inserido."); // Se essa linha rodar, algo está errado
        } catch (error) {
            console.log(`   [VALIDAÇÃO OK]: Operação rejeitada. Motivo: ${error.message}`);
            console.log("   (Erro registrado em 'erros.log' conforme requisito)");
        }

        // 3.2. Teste de Falha: Inserir Comentário SEM ID DO VÍDEO
        try {
            console.log(" -> Tentando inserir Comentário sem ID do Vídeo...");
            await comentarioDAO.inserirComentario({ texto: "teste", idUsuario: novoUsuarioId });
            console.log("   [ERRO]: A validação falhou, o comentário foi inserido.");
        } catch (error) {
            console.log(`   [VALIDAÇÃO OK]: Operação rejeitada. Motivo: ${error.message}`);
            console.log("   (Erro registrado em 'erros.log' conforme requisito)");
        }

        // 4.1. Deletar o Vídeo
        const deletadosVideo = await videoDAO.deletarVideo(novoVideoId);
        console.log(` -> Vídeo deletado: ${deletadosVideo} registro(s) removido(s).`);

        // 4.2. Deletar o Usuário
        const deletadosUsuario = await usuarioDAO.deletarUsuario({ email: "tech@pro.com" });
        console.log(` -> Usuário deletado: ${deletadosUsuario} registro(s) removido(s).`);
        
    } catch (e) {
        // Captura erros críticos (como falha de conexão) e encerra
        console.error("\n[ERRO CRÍTICO] A aplicação encontrou uma falha fatal:", e.message);
    } finally {
        // Garante que o cliente seja fechado
        if (client) {
            await client.close();
            console.log("Conexão com o MongoDB encerrada.");
        }
    }
}

demonstrarFuncionalidades();