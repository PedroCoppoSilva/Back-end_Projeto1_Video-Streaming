// index.js

const { connectDB, client } = require('./db');
const Usuario = require('./usuario'); // Importe a classe Usuario
const logger = require('./logger_custom');

async function testarInsercaoUsuario() {
    let db;
    try {
        // 1. Conecta ao banco de dados e obtém a instância do DB
        db = await connectDB(); 

        // 2. Cria uma instância da classe de acesso ao Usuario
        const usuarioDAO = new Usuario(db); 

        // --- TESTE 1: INSERÇÃO BEM-SUCEDIDA ---
        console.log("--- Executando Teste 1: Inserção Válida ---");
        const dadosUsuarioValido = {
            nome: "Alice Silva",
            email: "alice.silva@teste.com",
            senha: "senhaSegura123",
            dataCadastro: new Date()
        };
        
        const novoId = await usuarioDAO.inserirUsuario(dadosUsuarioValido);
        console.log(`SUCESSO: Usuário inserido com ID: ${novoId}`);
        logger.info(`Usuário inserido: ${dadosUsuarioValido.email}`);


        // --- TESTE 2: VALIDAÇÃO DE CAMPO OBRIGATÓRIO (REQUISITO DO PROJETO) ---
        console.log("\n--- Executando Teste 2: Inserção Inválida (Sem Nome) ---");
        const dadosUsuarioInvalido = {
            // nome: "Bob", // Nome propositalmente faltando
            email: "bob.falha@teste.com",
            senha: "senhaForte"
        };

        try {
            await usuarioDAO.inserirUsuario(dadosUsuarioInvalido);
            console.log("FALHA DO TESTE: A inserção deveria ter dado erro, mas não deu!");
        } catch (error) {
            // O erro deve ser capturado aqui e logado pela sua classe Usuario
            console.log(`SUCESSO: Falha de validação esperada: ${error.message}`);
        }

        const encontrado = await usuarioDAO.buscarUsuario({ email: "alice.silva@teste.com" });
        console.log("Usuário encontrado:", encontrado);

        const apagado = await usuarioDAO.deletarUsuario({ email: "alice.silva@teste.com" });
        console.log("Usuários deletados:", apagado);

        const encontrado2 = await usuarioDAO.buscarUsuario({ nome: "Alice Silva" });
        console.log("Usuário encontrado:", encontrado2);
        
    } catch (e) {
        console.error("ERRO FATAL NA EXECUÇÃO DO TESTE:", e.message);
    } finally {
        // 3. Garante que a conexão com o cliente MongoDB seja fechada
        if (client) {
            await client.close();
            console.log("\nConexão com o MongoDB fechada.");
        }
    }
}

testarInsercaoUsuario();