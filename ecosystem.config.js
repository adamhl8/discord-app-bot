module.exports = {
  apps : [{
    name: 'app-bot',
    script: 'dist/app-bot.js',
    args: '.env',
    instances: 1,
    autorestart: true,
    watch: false,
    exec_mode: "fork",
    log_date_format: "[[]YYYY-MM-DD [at] HH:mm:ss]",
    combine_logs: true,
    error_file: "logs/errors.log",
    out_file: "logs/app-bot.log"
  },
  {
    name: 'test-app-bot',
    script: 'dist/app-bot.js',
    args: '.env-test',
    instances: 1,
    autorestart: true,
    watch: false,
    exec_mode: "fork",
    log_date_format: "[[]YYYY-MM-DD [at] HH:mm:ss]",
    combine_logs: true,
    error_file: "logs/test-errors.log",
    out_file: "logs/test-app-bot.log"
  }]
};
