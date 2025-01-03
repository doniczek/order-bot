const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const config = require('../config/config.json');
const TICKET_TYPES = require('../config/tickets.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Zarządzanie systemem ticketów')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Ustawia wiadomość do tworzenia ticketów')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Typ ticketów')
                        .setRequired(true)
                        .addChoices(
                            { name: '❓ Pomoc', value: 'help' },
                            { name: '🛍️ Usługi', value: 'services' }
                        ))
                .addChannelOption(option =>
                    option.setName('kanał')
                        .setDescription('Kanał na którym ma być wiadomość')
                        .setRequired(false))),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'set') {
            const channel = interaction.options.getChannel('kanał') || interaction.channel;
            const type = TICKET_TYPES[interaction.options.getString('type').toUpperCase()];

            const button = new ButtonBuilder()
                .setCustomId(`create_ticket_${type.id}`)
                .setLabel(`${type.emoji} Otwórz ticket`)
                .setStyle(ButtonStyle.Primary);

            const embed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle(`${type.emoji} ${type.name}`)
                .setDescription(type.description)
                .setFooter({ text: interaction.guild.name })
                .setTimestamp();

            try {
                await channel.send({
                    embeds: [embed],
                    components: [new ActionRowBuilder().addComponents(button)]
                });

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(config.colors.success)
                            .setDescription(`✅ System ticketów typu **${type.name}** został pomyślnie skonfigurowany!`)
                    ],
                    ephemeral: true
                });
            } catch (error) {
                console.error('Błąd podczas ustawiania systemu ticketów:', error);
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(config.colors.error)
                            .setDescription('❌ Wystąpił błąd podczas konfiguracji systemu ticketów!')
                    ],
                    ephemeral: true
                });
            }
        }
    },
}; 