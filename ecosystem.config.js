module.exports = {
  apps: [
    {
      name: "app-bot",
      script: "dist/index.js",
      args: ".env",
      log_date_format: "[[]YYYY-MM-DD [at] HH:mm:ss]",
      combine_logs: true,
      error_file: "logs/errors.log",
      out_file: "logs/app-bot.log",
    },
    {
      name: "test-app-bot",
      script: "dist/index.js",
      args: ".env-test",
      log_date_format: "[[]YYYY-MM-DD [at] HH:mm:ss]",
      combine_logs: true,
      error_file: "logs/test-errors.log",
      out_file: "logs/test-app-bot.log",
    },
  ],
}
