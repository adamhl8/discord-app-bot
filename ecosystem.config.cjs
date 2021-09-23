module.exports = {
  apps: [
    {
      name: 'discord-app-bot',
      script: 'node --loader ts-node/esm ./src/index.ts',
      log_date_format: '[[]YYYY-MM-DD [at] HH:mm:ss]',
      combine_logs: true,
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
    },
  ],
}
