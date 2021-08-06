#!/bin/bash
sudo cp discord-app-bot.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable discord-app-bot
sudo systemctl start discord-app-bot
sudo systemctl status discord-app-bot