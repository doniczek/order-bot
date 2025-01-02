const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config/config.json');
const EmbedMessages = require('../utils/embeds.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ogloszenie')
        .setDescription('Tworzy ogłoszenie w formie embeda')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('tytuł')
                .setDescription('Tytuł ogłoszenia')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('treść')
                .setDescription('Treść ogłoszenia')
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('obraz')
                .setDescription('Obraz do ogłoszenia')
                .setRequired(false))
        .addChannelOption(option =>
            option.setName('kanał')
                .setDescription('Kanał, na którym ma być wysłane ogłoszenie')
                .setRequired(false)),

    async execute(interaction) {
        const title = interaction.options.getString('tytuł');
        const content = interaction.options.getString('treść');
        const image = interaction.options.getAttachment('obraz');
        const channel = interaction.options.getChannel('kanał') || interaction.channel;

        const announcementEmbed = new EmbedBuilder()
            .setColor(config.colors.announcement)
            .setTitle(title)
            .setDescription(content)
            .setTimestamp()
            .setFooter({ 
                text: `Ogłoszenie od ${interaction.user.tag}`, 
                iconURL: interaction.user.displayAvatarURL() 
            });

        if (image) {
            if (image.contentType?.startsWith('image/')) {
                announcementEmbed.setImage(image.url);
            } else {
                await interaction.reply({
                    embeds: [EmbedMessages.error('Załączony plik nie jest obrazem!')],
                    ephemeral: true
                });
                return;
            }
        }

        try {
            const announcementMessage = await channel.send({ 
                embeds: [announcementEmbed]
            });

            await announcementMessage.react(config.emojis.success);
            
            await interaction.reply({ 
                embeds: [EmbedMessages.success(`Ogłoszenie zostało pomyślnie wysłane na kanał ${channel}`)],
                ephemeral: true 
            });
        } catch (error) {
            console.error('Błąd podczas wysyłania ogłoszenia:', error);
            await interaction.reply({ 
                embeds: [EmbedMessages.error('Wystąpił błąd podczas wysyłania ogłoszenia!')],
                ephemeral: true 
            });
        }
    },
}; 