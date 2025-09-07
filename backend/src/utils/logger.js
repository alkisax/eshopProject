import { createLogger, format, transports } from 'winston';
import 'winston-mongodb';

const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.simple()
  ),
  transports: [
    // new transports.Console(), // show logs in terminal

    new transports.File({      // save to file
      filename: 'logs/all.log'
    }),

    // new transports.MongoDB({   // save to MongoDB
    //   db: process.env.MONGODB_URI || 'mongodb://localhost:27017/logsdb',
    //   collection: 'logs',
    //   level: 'info',  // logs info and above (warn, error)
    // })
  ]
});

export default logger;