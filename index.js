const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const config = require('./config/config.json');
const fs = require('fs').promises;
const path = require('path');

class App {
    constructor() {
        this.initializeAPI();
        this.initializeBot();
    }

    initializeAPI() {
        this.app = express();
        this.app.use(bodyParser.json());

        this.setupAPIRoutes();

        const PORT = process.env.PORT || 3000;
        this.app.listen(PORT, () => {
            console.log(`API działa na porcie ${PORT}`);
        });
    }

    async deployCommands() {
        try {
            const commands = [];
            const commandsPath = path.join(__dirname, 'commands');
            const commandFiles = await fs.readdir(commandsPath);

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
            console.log(`🔄 Rozpoczęto odświeżanie ${commands.length} komend aplikacji...`);

            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );

            console.log(`✅ Pomyślnie odświeżono ${commands.length} komend aplikacji`);
            return commands;
        } catch (error) {
            console.error('❌ Błąd podczas odświeżania komend:', error);
            throw error;
        }
    }

    async initializeBot() {
        this.client = new Client({
            intents: Object.values(GatewayIntentBits)
        });

        this.client.commands = new Collection();
        this.client.giveaways = new Map();
        this.client.verificationCodes = new Map();

        this.client.on('ready', async () => {
            console.log(`Zalogowano jako ${this.client.user.tag}`);
            
            try {
                const commands = await this.deployCommands();
                commands.forEach(cmd => {
                    const command = require(`./commands/${cmd.name}.js`);
                    this.client.commands.set(cmd.name, command);
                });
            } catch (error) {
                console.error('Błąd podczas deployowania komend:', error);
            }

            this.client.user.setPresence({
                activities: [{
                    name: config.status.text,
                    type: config.status.type
                }],
                status: config.status.status
            });
        });

        await this.loadEvents();
        await this.loadCommands();

        this.client.login(process.env.BOT_TOKEN);
    }

    setupAPIRoutes() {
        this.app.post('/verify-code', [
            body('code').isString().isLength({ min: 6, max: 6 }).matches(/^\d+$/),
            body('minecraftNick').isString().matches(/^[a-zA-Z0-9_]{3,16}$/)
        ], async (req, res) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({
                        success: false,
                        errors: errors.array()
                    });
                }

                const { code, minecraftNick } = req.body;
                const verificationData = this.client.verificationCodes.get(code);

                if (!verificationData) {
                    return res.status(404).json({
                        success: false,
                        message: 'Kod weryfikacyjny nie istnieje lub wygasł'
                    });
                }

                if (verificationData.used) {
                    return res.status(400).json({
                        success: false,
                        message: 'Kod został już użyty'
                    });
                }

                if (verificationData.minecraftNick !== minecraftNick) {
                    return res.status(400).json({
                        success: false,
                        message: 'Nieprawidłowy nick Minecraft'
                    });
                }

                verificationData.used = true;
                this.client.verificationCodes.set(code, verificationData);

                const channel = this.client.channels.cache.get(config.channels.rewards);
                if (channel) {
                    const user = await this.client.users.fetch(verificationData.userId);
                    const embed = new EmbedBuilder()
                        .setColor(config.colors.success)
                        .setTitle('✅ Weryfikacja zakończona')
                        .setDescription(`
🎮 **Minecraft:** \`${minecraftNick}\`
👤 **Discord:** ${user}
⏰ **Data:** <t:${Math.floor(Date.now() / 1000)}:F>
                        `)
                        .setTimestamp();

                    await channel.send({ embeds: [embed] });
                }

                res.status(200).json({
                    success: true,
                    message: 'Weryfikacja zakończona pomyślnie',
                    data: {
                        discordId: verificationData.userId,
                        minecraftNick,
                        verifiedAt: new Date().toISOString()
                    }
                });

            } catch (error) {
                console.error('Błąd podczas weryfikacji kodu:', error);
                res.status(500).json({
                    success: false,
                    message: 'Wystąpił błąd podczas weryfikacji kodu'
                });
            }
        });
    }

    async loadEvents() {
        const fs = require('fs').promises;
        const path = require('path');
        const eventsPath = path.join(__dirname, 'events');
        const eventFiles = await fs.readdir(eventsPath);

        for (const file of eventFiles) {
            const event = require(`./events/${file}`);
            if (event.type === 'once') {
                this.client.once(event.name, (...args) => event.execute(...args, this.client));
            } else {
                this.client.on(event.name, (...args) => event.execute(...args, this.client));
            }
        }
    }

    async loadCommands() {
        const fs = require('fs').promises;
        const path = require('path');
        const commandsPath = path.join(__dirname, 'commands');
        const commandFiles = await fs.readdir(commandsPath);

        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            this.client.commands.set(command.data.name, command);
        }
    }
}

require('dotenv').config();
const app = new App();