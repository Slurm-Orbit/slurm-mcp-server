import log4js from 'log4js';

log4js.configure({
    appenders: {
      file: { 
        type: 'file', 
        filename: 'agent-history.log'
      }
    },
    categories: {
      default: { 
        appenders: ['file'], 
        level: 'info' 
      }
    }
  });
  
  const logger = log4js.getLogger();
  export { logger };