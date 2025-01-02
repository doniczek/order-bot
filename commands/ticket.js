const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const config = require('../config/config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Zarządzanie systemem ticketów')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Ustawia wiadomość do tworzenia ticketów')
                .addChannelOption(option =>
                    option.setName('kanał')
                        .setDescription('Kanał na którym ma być wiadomość')
                        .setRequired(false))),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'set') {
            const channel = interaction.options.getChannel('kanał') || interaction.channel;

            const button = new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('📩 Otwórz ticket')
                .setStyle(ButtonStyle.Primary);

            const embed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle('🎫 System Ticketów')
                .setDescription(`
📝 **Potrzebujesz pomocy?**
Kliknij przycisk poniżej, aby otworzyć ticket!

ℹ️ **Informacje:**
• Ticket zostanie utworzony w osobnym kanale
• Dostęp do ticketu będą mieli tylko Ty i administracja
• Prosimy o cierpliwość w oczekiwaniu na odpowiedź
                `)
                .setFooter({ text: interaction.guild.name })
                .setTimestamp();

            try {
                await channel.send({
                    embeds: [embed],
                    components: [new ActionRowBuilder().addComponents(button)]
                });

                await interaction.reply({
                    content: '✅ System ticketów został pomyślnie skonfigurowany!',
                    ephemeral: true
                });
            } catch (error) {
                console.error('Błąd podczas ustawiania systemu ticketów:', error);
                await interaction.reply({
                    content: '❌ Wystąpił błąd podczas konfiguracji systemu ticketów!',
                    ephemeral: true
                });
            }
        }
    },
}; 