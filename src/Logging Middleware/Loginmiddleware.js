
const LOG_SERVER_URL = 'http://20.244.56.144/evaluation-service/logs';

/**
 * Sends a log entry to the server.
 * @param {string} stack - The stack or module where the log originates.
 * @param {string} level - Log level: 'info', 'warn', 'error', 'debug', etc.
 * @param {string} packageName - The package or feature name.
 * @param {string} message - Detailed, specific log message.
 */
async function Log(stack, level, packageName, message) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        stack,
        level,
        package: packageName,
        message,
        userAgent: navigator.userAgent,
        url: window.location.href
    };

    try {
        await fetch(LOG_SERVER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logEntry)
        });
    } catch (error) {
        
        console.error('Failed to send log:', error, logEntry);
    }
}

export default Log;