const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config/config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reward')
        .setDescription('Generuje kod weryfikacyjny dla nagrody')
        .addStringOption(option => 
            option.setName('username')
                .setDescription('Twój nick z Minecraft')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(16)),

    async execute(interaction) {
        try {
            const minecraftNick = interaction.options.getString('username');

            if (!minecraftNick.match(/^[a-zA-Z0-9_]{3,16}$/)) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(config.colors.error)
                            .setTitle('❌ Błąd')
                            .setDescription('Nieprawidłowy nick Minecraft!')
                    ],
                    ephemeral: true
                });
            }

            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            if (!interaction.client.verificationCodes) {
                interaction.client.verificationCodes = new Map();
            }

            interaction.client.verificationCodes.set(verificationCode, {
                userId: interaction.user.id,
                minecraftNick,
                timestamp: Date.now(),
                used: false
            });

            setTimeout(() => {
                interaction.client.verificationCodes.delete(verificationCode);
            }, 15 * 60 * 1000);

            const embed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setAuthor({
                    name: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .setTitle('🎮 Weryfikacja Minecraft')
                .setDescription(`
🔑 **Twój kod weryfikacyjny:** \`${verificationCode}\`

📝 **Instrukcja:**
• Wejdź na serwer Minecraft
• Wpisz komendę \`/verify ${verificationCode}\`
• Poczekaj na potwierdzenie weryfikacji

⚠️ **Uwaga:**
• Kod jest ważny przez 15 minut
• Można użyć go tylko raz
• Jest przypisany do nicku: \`${minecraftNick}\`
                `)
                .setFooter({ text: 'Kod wygaśnie za 15 minut' })
                .setTimestamp();

            return await interaction.reply({ 
                embeds: [embed],
                ephemeral: true 
            });

        } catch (error) {
            console.error('Błąd w komendzie reward:', error);
            
            return await interaction.reply({ 
                embeds: [
                    new EmbedBuilder()
                        .setColor(config.colors.error)
                        .setTitle('❌ Błąd')
                        .setDescription('Wystąpił błąd podczas generowania kodu. Spróbuj ponownie później.')
                ],
                ephemeral: true 
            });
        }
    }
}; 