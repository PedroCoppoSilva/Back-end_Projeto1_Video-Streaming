const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'erros.log');

function getTimestamp() {
    const date = new Date();
    return date.toISOString();
}

function logToFile(level, message, details = {}) {
    const timestamp = getTimestamp();
    let logMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}`;

    if (Object.keys(details).length > 0) {
        logMessage += `\nDetalhes: ${JSON.stringify(details, null, 2)}`;
    }
    logMessage += '\n' + '-'.repeat(50) + '\n';

    try {
        fs.appendFileSync(LOG_FILE, logMessage);
    } catch (err) {
        console.error('ERRO FATAL: Falha ao escrever no arquivo de log!', err);
    }
}

module.exports = {
    error: (message, details) => logToFile('error', message, details),
    info: (message, details) => logToFile('info', message, details),
};