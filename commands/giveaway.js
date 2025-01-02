const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');
const config = require('../config/config.json');
const EmbedMessages = require('../utils/embeds.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Tworzy nowy konkurs')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName('nagroda')
                .setDescription('Co można wygrać?')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('czas')
                .setDescription('Czas trwania konkursu')
                .setRequired(true)
                .addChoices(
                    { name: '1 minuta', value: '1m' },
                    { name: '5 minut', value: '5m' },
                    { name: '10 minut', value: '10m' },
                    { name: '15 minut', value: '15m' },
                    { name: '30 minut', value: '30m' },
                    { name: '1 godzina', value: '1h' },
                    { name: '2 godziny', value: '2h' },
                    { name: '5 godzin', value: '5h' },
                    { name: '12 godzin', value: '12h' },
                    { name: '1 dzień', value: '24h' },
                    { name: '3 dni', value: '72h' },
                    { name: '1 tydzień', value: '168h' }
                ))
        .addIntegerOption(option => 
            option.setName('zwycięzcy')
                .setDescription('Liczba zwycięzców')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(10))
        .addChannelOption(option =>
            option.setName('kanał')
                .setDescription('Kanał na którym ma być konkurs')
                .setRequired(false)),

    async execute(interaction) {
        const prize = interaction.options.getString('nagroda');
        const duration = ms(interaction.options.getString('czas'));
        const winnersCount = interaction.options.getInteger('zwycięzcy');
        const channel = interaction.options.getChannel('kanał') || interaction.channel;
        const endTime = Date.now() + duration;

        const button = new ButtonBuilder()
            .setCustomId(`giveaway_${Date.now()}`)
            .setLabel('🎉 Dołącz do konkursu!')
            .setStyle(ButtonStyle.Primary);

        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle('🎉 NOWY KONKURS!')
            .setDescription(`
🎁 **Nagroda:** ${prize}
👥 **Liczba zwycięzców:** ${winnersCount}
⏰ **Kończy się:** <t:${Math.floor(endTime / 1000)}:R>
🎫 **Uczestnicy:** 0

📝 **Konkurs stworzony przez:** <@${interaction.user.id}>
            `)
            .setFooter({ text: 'Status: trwa' })
            .setTimestamp();

        try {
            const message = await channel.send({
                embeds: [embed],
                components: [new ActionRowBuilder().addComponents(button)]
            });

            const giveawayData = {
                participants: new Set(),
                prize,
                winnersCount,
                endTime
            };

            setTimeout(async () => {
                try {
                    const participants = Array.from(giveawayData.participants);
                    const winners = participants.length > 0 
                        ? participants.sort(() => Math.random() - 0.5).slice(0, winnersCount)
                        : [];
                    
                    const winnersText = winners.length > 0 
                        ? winners.map(id => `<@${id}>`).join(', ')
                        : 'Brak uczestników';

                    const endEmbed = new EmbedBuilder()
                        .setColor(config.colors.success)
                        .setTitle('🎉 KONKURS ZAKOŃCZONY!')
                        .setDescription(`
🎁 **Nagroda:** ${prize}
🏆 **Zwycięzca:** ${winnersText}
👥 **Liczba uczestników:** ${participants.length}

📝 **Konkurs stworzony przez:** <@${interaction.user.id}>
                        `)
                        .setFooter({ text: 'Status: zakończony' })
                        .setTimestamp();

                    if (winners.length === 1) {
                        const winner = await interaction.client.users.fetch(winners[0]);
                        endEmbed.setThumbnail(winner.displayAvatarURL({ dynamic: true }));
                    }

                    await message.edit({
                        embeds: [endEmbed],
                        components: []
                    });

                    if (winners.length > 0) {
                        for (const winnerId of winners) {
                            try {
                                const winner = await interaction.client.users.fetch(winnerId);
                                const winnerEmbed = EmbedMessages.success('🎉 Gratulacje! Wygrałeś konkurs!')
                                    .setThumbnail(winner.displayAvatarURL({ dynamic: true }))
                                    .addFields(
                                        { 
                                            name: 'Status', 
                                            value: '🏆 Wygrałeś konkurs!', 
                                            inline: true 
                                        },
                                        { 
                                            name: 'Nagroda', 
                                            value: prize, 
                                            inline: true 
                                        },
                                        {
                                            name: 'Serwer',
                                            value: interaction.guild.name,
                                            inline: true
                                        }
                                    );

                                await channel.send({
                                    content: `<@${winnerId}>`,
                                    embeds: [winnerEmbed],
                                    allowedMentions: { users: [winnerId] }
                                });
                            } catch (error) {
                                console.error(`Błąd podczas wysyłania powiadomienia do zwycięzcy ${winnerId}:`, error);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Błąd podczas kończenia konkursu:', error);
                }
            }, duration);

            interaction.client.giveaways.set(message.id, giveawayData);

            await interaction.reply({
                embeds: [EmbedMessages.success(`Konkurs został utworzony na kanale ${channel}!`)],
                ephemeral: true
            });

        } catch (error) {
            console.error('Błąd podczas tworzenia konkursu:', error);
            await interaction.reply({
                embeds: [EmbedMessages.error('Wystąpił błąd podczas tworzenia konkursu!')],
                ephemeral: true
            });
        }
    },
}; 