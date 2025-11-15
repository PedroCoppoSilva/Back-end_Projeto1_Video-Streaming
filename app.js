const express = require('express');
const session = require('express-session');
const { connectDB } = require('./db'); 
const Usuario = require('./usuario'); 
const Video = require('./video');
const Comentario = require('./comentario');

const app = express();
const port = 3000;

// Middlewares essenciais
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Configuração da Sessão
app.use(session({
  secret: 'secret', 
  resave: false,
  saveUninitialized: true,
    cookie: { secure: false } 
}));

// Variáveis para os DAOs
let usuarioDAO, videoDAO, comentarioDAO;

// Middleware de Autenticação
function checkAuth(req, res, next) {
  if (req.session.userId) {
    console.log("usuário está logado");
    next();
  } else {
    console.log("Usuário não está logado");
    res.status(401).json({ erro: "Acesso não autorizado. Faça login primeiro." });
  }
}


// Função principal para iniciar o servidor
async function startServer() {
  try {
    const db = await connectDB(); 

    usuarioDAO = new Usuario(db);
    videoDAO = new Video(db);
    comentarioDAO = new Comentario(db);

    
    //Rotas de Autenticação

    // Rota de Registro (POST /register)
    app.post('/register', async (req, res) => {
      try {
        // req.body contém os dados enviados (nome, email, senha)
        const novoUsuarioId = await usuarioDAO.inserirUsuario(req.body);
        res.status(201).json({ 
          message: "Usuário cadastrado com sucesso!", 
          id: novoUsuarioId 
        });
      } catch (error) {
        // Captura o erro da validação
        res.status(400).json({ erro: error.message });
      }
    });

    // Rota de Login (POST /login)
    app.post('/login', async (req, res) => {
      const { email, senha } = req.body;

      try {
        const usuario = await usuarioDAO.buscarUsuario({ email: email });
        if (!usuario) {
          // Mensagem genérica para não dar dicas de segurança
          return res.status(401).json({ erro: "E-mail ou senha inválidos." });
        }

        // CORREÇÃO: Compara a senha enviada (simples) com a senha salva (simples) no banco
        const senhaValida = (usuario.senha === senha);
        
        if (!senhaValida) {
          return res.status(401).json({ erro: "E-mail ou senha inválidos." });
        }

        // SUCESSO: Salva ID e nome na sessão
        req.session.userId = usuario._id;
        req.session.userName = usuario.nome;

        res.status(200).json({ message: `Bem-vindo, ${usuario.nome}!` });

      } catch (error) {
        res.status(500).json({ erro: `Erro no login: ${error.message}` });
      }
    });

    // Rota de Logout (GET /logout)
    app.get('/logout', (req, res) => {
      req.session.destroy(err => {
        if (err) {
          return res.status(500).json({ erro: "Não foi possível fazer logout." });
        }
        res.status(200).json({ message: "Logout realizado com sucesso." });
      });
    });

    //Rotas de vídeo

    // Buscar vídeos (GET /videos/search?termo=node)
    app.get('/videos/search', async (req, res) => {
      try {
        const termo = req.query.termo; 
        const videos = await videoDAO.buscarVideosPorPalavraChave(termo);
        res.status(200).json(videos);
      } catch (error) {
        // Captura o erro da validação
        res.status(400).json({ erro: error.message });
      }
    });

    // Enviar um novo vídeo (Rota Protegida)
    // (POST /videos)
    app.post('/videos', checkAuth, async (req, res) => {
      try {
        const dadosVideo = {
          ...req.body,
          idUsuario: req.session.userId 
        };
        
        const novoVideoId = await videoDAO.inserirVideo(dadosVideo);
        res.status(201).json({ message: "Vídeo enviado!", id: novoVideoId });

      } catch (error) {
        // Captura erros de validação
        res.status(400).json({ erro: error.message });
      }
    });

    // Deletar um vídeo (Rota Protegida)
    // (DELETE /videos/ID_DO_VIDEO)
    app.delete('/videos/:id', checkAuth, async (req, res) => {
      try {
        const idVideo = req.params.id; 

        const video = await videoDAO.buscarVideoPorId(idVideo);
                if (!video) { return res.status(404).json({ erro: "Vídeo não encontrado." }); }

                if (video.idUsuario.toString() !== req.session.userId.toString()) {
                    return res.status(403).json({ erro: "Você não tem permissão para deletar este vídeo." });
                }
                const deletados = await videoDAO.deletarVideo(idVideo);
        if (deletados === 0) {
          return res.status(404).json({ erro: "Vídeo não encontrado." });
        }
        res.status(200).json({ message: "Vídeo deletado." });

      } catch (error) {
        res.status(500).json({ erro: error.message });
      }
    });

    //Rota de comentário

    // Buscar comentários de um vídeo
    // (GET /videos/ID_DO_VIDEO/comments)
    app.get('/videos/:idVideo/comments', async (req, res) => {
      try {
        const idVideo = req.params.idVideo;
        const comentarios = await comentarioDAO.buscarComentariosPorVideo(idVideo);
        res.status(200).json(comentarios);
      } catch (error) {
        res.status(400).json({ erro: error.message });
      }
    });

    // Postar um comentário (Rota Protegida)
    // (POST /videos/ID_DO_VIDEO/comments)
    app.post('/videos/:idVideo/comments', checkAuth, async (req, res) => {
      try {
        const dadosComentario = {
          texto: req.body.texto,
          idVideo: req.params.idVideo,   
          idUsuario: req.session.userId   
        };

        const novoComentarioId = await comentarioDAO.inserirComentario(dadosComentario);
        res.status(201).json({ message: "Comentário publicado!", id: novoComentarioId });

      } catch (error) {
        // Captura validação
        res.status(400).json({ erro: error.message });
      }
    });


    // 4. Inicia o servidor
    app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
    });

  } catch (e) {
    console.error("Falha fatal ao iniciar o servidor:", e.message);
    process.exit(1); 
  }
}

startServer();