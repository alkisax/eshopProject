"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
// import 'winston-mongodb';
const logger = (0, winston_1.createLogger)({
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.simple()),
    transports: [
        // new transports.Console(), // show logs in terminal
        new winston_1.transports.File({
            filename: 'logs/all.log'
        }),
        // new transports.MongoDB({   // save to MongoDB
        //   db: process.env.MONGODB_URI || 'mongodb://localhost:27017/logsdb',
        //   collection: 'logs',
        //   level: 'info',  // logs info and above (warn, error)
        // })
    ]
});
exports.default = logger;
//# sourceMappingURL=logger.js.map