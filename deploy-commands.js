const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`✅ Załadowano komendę: ${command.data.name}`);
    } else {
        console.log(`⚠️ Komenda w ${file} nie ma wymaganych właściwości "data" lub "execute"`);
    }
}

const rest = new REST().setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log(`🔄 Rozpoczęto odświeżanie ${commands.length} komend aplikacji...`);

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`✅ Pomyślnie odświeżono ${data.length} komend aplikacji`);
    } catch (error) {
        console.error('❌ Błąd podczas odświeżania komend:', error);
    }
})(); 