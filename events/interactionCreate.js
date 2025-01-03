const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const priceConfig = require('../config/prices.json');
const config = require('../config/config.json');
const EmbedMessages = require('../utils/embeds.js');
const TICKET_TYPES = require('../config/tickets.js');

module.exports = {
    name: 'interactionCreate',
    type: 'on',
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: '❌ Wystąpił błąd podczas wykonywania komendy!',
                    ephemeral: true
                });
            }
        }

        if (interaction.isStringSelectMenu() && interaction.customId === 'category-select-static') {
            const selectedCategory = priceConfig.categories[interaction.values[0]];

            const categoryEmbed = new EmbedBuilder()
                .setColor(priceConfig.settings.embedColor)
                .setTitle(`${selectedCategory.emoji} ${selectedCategory.name}`)
                .setDescription('**Szczegółowy cennik wybranej kategorii:**')
                .addFields(
                    selectedCategory.products.map(product => ({
                        name: `${product.name}`,
                        value: `💰 **Cena:** ${product.price}\n📝 ${product.description}`,
                        inline: false
                    }))
                )
                .setFooter({ text: priceConfig.settings.footerText });

            await interaction.reply({
                embeds: [categoryEmbed],
                ephemeral: true
            });
        }

        if (interaction.isButton() && interaction.customId.startsWith('giveaway_')) {
            await interaction.deferUpdate();
            
            const giveawayData = client.giveaways.get(interaction.message.id);
            if (!giveawayData) return;

            const userId = interaction.user.id;
            let responseEmbed;
            
            if (giveawayData.participants.has(userId)) {
                giveawayData.participants.delete(userId);
                responseEmbed = new EmbedBuilder()
                    .setColor(config.colors.error)
                    .setAuthor({ 
                        name: interaction.user.tag, 
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
                    })
                    .setTitle('❌ Opuściłeś konkurs!')
                    .addFields(
                        { 
                            name: '🎁 Nagroda', 
                            value: giveawayData.prize, 
                            inline: true 
                        },
                        { 
                            name: '⏰ Kończy się', 
                            value: `<t:${Math.floor(giveawayData.endTime / 1000)}:R>`, 
                            inline: true 
                        },
                        {
                            name: '👥 Uczestnicy',
                            value: `${giveawayData.participants.size}`,
                            inline: true
                        }
                    )
                    .setTimestamp();
            } else {
                giveawayData.participants.add(userId);
                responseEmbed = new EmbedBuilder()
                    .setColor(config.colors.success)
                    .setAuthor({ 
                        name: interaction.user.tag, 
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
                    })
                    .setTitle('✅ Dołączyłeś do konkursu!')
                    .setDescription('🍀 Życzymy powodzenia!')
                    .addFields(
                        { 
                            name: '🎁 Nagroda', 
                            value: giveawayData.prize, 
                            inline: true 
                        },
                        { 
                            name: '⏰ Kończy się', 
                            value: `<t:${Math.floor(giveawayData.endTime / 1000)}:R>`, 
                            inline: true 
                        },
                        {
                            name: '👥 Uczestnicy',
                            value: `${giveawayData.participants.size}`,
                            inline: true
                        }
                    )
                    .setTimestamp();
            }

            const giveawayEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                .setDescription(interaction.message.embeds[0].description.replace(
                    /\*\*Uczestnicy:\*\* \d+/,
                    `**Uczestnicy:** ${giveawayData.participants.size}`
                ));

            await interaction.message.edit({ embeds: [giveawayEmbed] });
            await interaction.followUp({ embeds: [responseEmbed], ephemeral: true });
        }

        if (interaction.isButton() && interaction.customId.startsWith('create_ticket_')) {
            await interaction.deferReply({ ephemeral: true });

            try {
                const ticketType = interaction.customId.replace('create_ticket_', '');
                const type = TICKET_TYPES[ticketType.toUpperCase()];
                
                const existingTicket = interaction.guild.channels.cache.find(
                    channel => channel.name === `${type.id}-${interaction.user.id}`
                );

                if (existingTicket) {
                    const existingTicketEmbed = new EmbedBuilder()
                        .setColor(config.colors.error)
                        .setTitle('❌ Nie można utworzyć ticketu')
                        .setDescription(`
Masz już otwarty ticket typu **${type.name}**! ${existingTicket}

⚠️ **Co możesz zrobić:**
• Użyj istniejącego ticketu
• Poczekaj na zamknięcie obecnego ticketu
• Skontaktuj się z administracją jeśli to błąd
                        `);

                    await interaction.editReply({
                        embeds: [existingTicketEmbed],
                        ephemeral: true
                    });
                    return;
                }

                let category = interaction.guild.channels.cache.find(
                    cat => cat.name === type.category && cat.type === 4
                );

                if (!category) {
                    category = await interaction.guild.channels.create({
                        name: type.category,
                        type: 4
                    });
                }

                const adminRole = interaction.guild.roles.cache.find(r => r.name === 'Administrator');

                const ticketChannel = await interaction.guild.channels.create({
                    name: `${type.id}-${interaction.user.id}`,
                    type: 0,
                    parent: category,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: ['ViewChannel']
                        },
                        {
                            id: interaction.user.id,
                            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
                        },
                        ...(adminRole ? [{
                            id: adminRole.id,
                            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
                        }] : [])
                    ]
                });

                const closeButton = new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('🔒 Zamknij ticket')
                    .setStyle(ButtonStyle.Danger);

                const ticketEmbed = new EmbedBuilder()
                    .setColor(config.colors.primary)
                    .setAuthor({ 
                        name: `${type.name} | ${interaction.user.tag}`, 
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
                    })
                    .setTitle(`${type.emoji} Nowy Ticket`)
                    .setDescription(`
${type.description}

${adminRole ? `👮 **Administracja:** ${adminRole}` : ''}
👤 **Użytkownik:** ${interaction.user}
                    `)
                    .setFooter({ text: interaction.guild.name })
                    .setTimestamp();

                await ticketChannel.send({
                    embeds: [ticketEmbed],
                    components: [new ActionRowBuilder().addComponents(closeButton)]
                });

                const ticketCreatedEmbed = new EmbedBuilder()
                    .setColor(config.colors.success)
                    .setTitle('✅ Ticket został utworzony!')
                    .setDescription(`
Twój ticket typu **${type.name}** został utworzony: ${ticketChannel}

ℹ️ **Co dalej:**
• Przejdź do utworzonego kanału
• Opisz swój problem/zapytanie
• Czekaj na odpowiedź administracji
                    `);

                await interaction.editReply({
                    embeds: [ticketCreatedEmbed],
                    ephemeral: true
                });

            } catch (error) {
                console.error('Błąd podczas tworzenia ticketu:', error);
                await interaction.editReply({
                    embeds: [EmbedMessages.error('Wystąpił błąd podczas tworzenia ticketu!')],
                    ephemeral: true
                });
            }
        }

        if (interaction.isButton() && interaction.customId === 'close_ticket') {
            await interaction.deferReply();

            try {
                const closeEmbed = new EmbedBuilder()
                    .setColor(config.colors.error)
                    .setAuthor({ 
                        name: interaction.user.tag, 
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
                    })
                    .setTitle('🔒 Ticket Zamknięty')
                    .setDescription(`Ticket został zamknięty przez ${interaction.user}`)
                    .setTimestamp();

                await interaction.channel.send({ embeds: [closeEmbed] });
                
                setTimeout(() => {
                    interaction.channel.delete()
                        .catch(error => console.error('Błąd podczas usuwania kanału ticketu:', error));
                }, 5000);

                await interaction.editReply({
                    embeds: [EmbedMessages.warning()
                        .setTitle('🔒 Zamykanie ticketu')
                        .setDescription('Ticket zostanie zamknięty za 5 sekund...')],
                });

            } catch (error) {
                console.error('Błąd podczas zamykania ticketu:', error);
                await interaction.editReply({
                    embeds: [EmbedMessages.error('Wystąpił błąd podczas zamykania ticketu!')],
                });
            }
        }
    },
}; 