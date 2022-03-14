# UXHill-Bot
This is the original Source Code used for the UXHill Discord Bot

# Host it yourself
In order for the Bot to work open config.json and provide an Token, an Prefix and your User ID
Open bot.js and provide an ID in the following lines
```js
[26 & 42] let guild = client.guilds.cache.get('Your Guild ID');
[27 & 43] let logs = guild.channels.cache.get('Your Logs Channel');
```
Open package.json and give the Bot a name
```json
"name": "Enter Bot Name (must be lowerspace, cant have spaces in it)"
```

When you have done everything open up cmd in the Bots Directory and type `npm install`
After everything is installed you can just type `npm start`

The Bot should be up and running!
If you encounter any bugs or you're having issues feel free to report it.
