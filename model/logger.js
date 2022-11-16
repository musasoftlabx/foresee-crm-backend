const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, prettyPrint } = format;
require("winston-mongodb");

const logger = createLogger({
  format: format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new transports.Console({
      level: "info",
      format: combine(format.colorize(), format.simple()),
    }),
    new transports.File({
      filename: "error.log",
      level: "error",
      format: combine(
        label({ label: "right meow!" }),
        timestamp(),
        prettyPrint()
      ),
    }),
    new transports.File({ filename: "./logs/combined.log" }),

    /* new transports.MongoDB({
      //level: 'error',
      db: process.env.DATABASE_URL,
      options: { useUnifiedTopology: true },
      collection: "logs",
      format: format.combine(format.timestamp(), format.json()),
    }), */
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.simple(),
    })
  );
}

module.exports = logger;
