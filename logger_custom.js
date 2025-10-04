// logger_custom.js
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'erros.log');

// Função para obter o timestamp formatado
function getTimestamp() {
    const date = new Date();
    return date.toISOString();
}

// Função para escrever o log no arquivo
function logToFile(level, message, details = {}) {
    const timestamp = getTimestamp();
    let logMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}`;

    // Inclui detalhes do erro, se houver
    if (Object.keys(details).length > 0) {
        logMessage += `\nDetalhes: ${JSON.stringify(details, null, 2)}`;
    }
    logMessage += '\n' + '-'.repeat(50) + '\n';

    // Usa fs.appendFileSync para garantir que o log seja escrito
    try {
        // O requisito é Armazenamento de arquivos de log com as excessões capturadas 
        fs.appendFileSync(LOG_FILE, logMessage);
    } catch (err) {
        console.error('ERRO FATAL: Falha ao escrever no arquivo de log!', err);
    }
}

module.exports = {
    error: (message, details) => logToFile('error', message, details),
    info: (message, details) => logToFile('info', message, details),
    // Adicione outros níveis se necessário
};