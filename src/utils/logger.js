const logLevels = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG',
  };
  
  class Logger {
    log(level, message, meta = {}) {
      const timestamp = new Date().toISOString();
      const logMessage = {
        timestamp,
        level,
        message,
        ...meta,
      };
  
      // In production, you might want to use a proper logging service
      if (process.env.NODE_ENV === 'production') {
        console.log(JSON.stringify(logMessage));
      } else {
        console.log(`[${timestamp}] ${level}:`, message, meta);
      }
    }
  
    error(message, meta) {
      this.log(logLevels.ERROR, message, meta);
    }
  
    warn(message, meta) {
      this.log(logLevels.WARN, message, meta);
    }
  
    info(message, meta) {
      this.log(logLevels.INFO, message, meta);
    }
  
    debug(message, meta) {
      if (process.env.NODE_ENV !== 'production') {
        this.log(logLevels.DEBUG, message, meta);
      }
    }
  }
  
  export const logger = new Logger();
  