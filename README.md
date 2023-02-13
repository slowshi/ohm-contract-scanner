# OHM Contract Scanner
This is a simple node script that will scan Arbitrum for new OHM/TIME contracts. It is looking for contracts with an epoch() function. If it finds one, it will send a message in Telegram. I told you it was simple.

Future features would include other chains and more information but this will work for now.

Requirements:
- Alchemy API Key
- Telegram Key from @BotFather
- Telegram Chat ID

# .env File
This project uses dotenv for environment variables. You will need to provide these if you want it to work.
```
ALCHEMY_API_KEY="SECRET"
TELEGRAM_KEY="SECRET"
TELEGRAM_CHAT_ID=SECRET
```