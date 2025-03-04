/**
 * Logger utility for consistent logging throughout the library
 */

// Log levels with corresponding priority values
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Current log level (default: INFO)
let currentLogLevel = LOG_LEVELS.INFO;

/**
 * Format a log message with timestamp and metadata
 * 
 * @private
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} [metadata] - Additional metadata
 * @returns {string} - Formatted log message
 */
function _formatLogMessage(level, message, metadata) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (metadata) {
    return `${formattedMessage} ${JSON.stringify(metadata)}`;
  }
  
  return formattedMessage;
}

/**
 * Log a message if its level is less than or equal to the current log level
 * 
 * @private
 * @param {string} level - Log level
 * @param {number} levelPriority - Priority of the log level
 * @param {string} message - Log message
 * @param {Object} [metadata] - Additional metadata
 */
function _log(level, levelPriority, message, metadata) {
  if (levelPriority > currentLogLevel) {
    return;
  }
  
  const formattedMessage = _formatLogMessage(level, message, metadata);
  
  switch (level) {
    case 'ERROR':
      console.error(formattedMessage);
      break;
    case 'WARN':
      console.warn(formattedMessage);
      break;
    case 'INFO':
      console.info(formattedMessage);
      break;
    case 'DEBUG':
      console.debug(formattedMessage);
      break;
    default:
      console.log(formattedMessage);
  }
}

/**
 * Set the current log level
 * 
 * @param {string} level - Log level (ERROR, WARN, INFO, DEBUG)
 */
function setLogLevel(level) {
  if (LOG_LEVELS[level] !== undefined) {
    currentLogLevel = LOG_LEVELS[level];
    info(`Log level set to ${level}`);
  } else {
    warn(`Invalid log level: ${level}. Using INFO.`);
  }
}

/**
 * Log an error message
 * 
 * @param {string} message - Error message
 * @param {Object} [metadata] - Additional metadata
 */
function error(message, metadata) {
  _log('ERROR', LOG_LEVELS.ERROR, message, metadata);
}

/**
 * Log a warning message
 * 
 * @param {string} message - Warning message
 * @param {Object} [metadata] - Additional metadata
 */
function warn(message, metadata) {
  _log('WARN', LOG_LEVELS.WARN, message, metadata);
}

/**
 * Log an info message
 * 
 * @param {string} message - Info message
 * @param {Object} [metadata] - Additional metadata
 */
function info(message, metadata) {
  _log('INFO', LOG_LEVELS.INFO, message, metadata);
}

/**
 * Log a debug message
 * 
 * @param {string} message - Debug message
 * @param {Object} [metadata] - Additional metadata
 */
function debug(message, metadata) {
  _log('DEBUG', LOG_LEVELS.DEBUG, message, metadata);
}

export default {
  setLogLevel,
  error,
  warn,
  info,
  debug,
  LOG_LEVELS
};