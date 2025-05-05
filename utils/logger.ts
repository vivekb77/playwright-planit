
/**
 * Simple logger implementation to avoid dependency issues
 */
export const logger = {
  info: (message: string): void => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] ${message}`);
  },
  
  error: (message: string): void => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] ${message}`);
  },
  
  warn: (message: string): void => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] ${message}`);
  },
  
  debug: (message: string): void => {
    const timestamp = new Date().toISOString();
    console.debug(`[${timestamp}] [DEBUG] ${message}`);
  }
};

/**
 * Log stream for integration with other tools
 */
export const logStream = {
  write: (message: string): void => {
    if (message.trim()) {
      logger.info(message.trim());
    }
  }
};