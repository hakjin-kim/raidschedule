const mongoose = require("mongoose");
const { publicKey, secret, token, dburi } = require('./config.json');
const { Client, IntentsBitField, Events, REST, Routes } = require('discord.js');
const { CommandHandler } = require('djs-commander');
const path = require('path');

const rest = new REST().setToken(token);





const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    
    ],
});

new CommandHandler({
    client, 
    commandsPath: path.join(__dirname, "commands")
});

  

client.on("ready", (c) => {
    console.log(`${c.user.tag} is online.`);
});

client.on("messageCreate", (message) => {
    if (message.content === "핑") {
        message.reply("퐁");
    }
});
  
// client.on(Events.InteractionCreate, interaction => {
// 	console.log(interaction);
// });


(async () => {
    try {
      await mongoose.connect(dburi);
      console.log("Connected to mongoDB");
  
      client.login(token);

      rest.put(Routes.applicationCommands('1227250750636163134'), { body: [] })
        .then(() => console.log('Successfully deleted all application commands.'))
        .catch(console.error);
    } catch (error) {
      console.log(`Error connecting to Db: ${error}`);
    }
  })();


    
 