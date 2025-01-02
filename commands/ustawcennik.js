const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const priceConfig = require('../config/prices.json');
const config = require('../config/config.json');
const EmbedMessages = require('../utils/embeds.js');

// Funkcja do tworzenia podstawowego embeda i menu
function createPricelistComponents() {
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('category-select-static')
        .setPlaceholder('Wybierz kategorię')
        .addOptions(
            Object.entries(priceConfig.categories).map(([id, category]) => ({
                label: category.name,
                description: `Cennik dla kategorii ${category.name}`,
                value: id,
                emoji: category.emoji
            }))
        );

    const categoriesList = Object.values(priceConfig.categories)
        .map(category => `${category.emoji} **${category.name}**`)
        .join('\n');

    const embed = new EmbedBuilder()
        .setColor(priceConfig.settings.embedColor)
        .setTitle('🏷️ Cennik Usług')
        .setDescription('**Dostępne kategorie:**\n\n' + categoriesList + '\n\n*Wybierz kategorię z menu poniżej, aby zobaczyć szczegółowy cennik.*')
        .setFooter({ text: priceConfig.settings.footerText });

    return { embed, selectMenu };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ustawcennik')
        .setDescription('Ustawia stały cennik na wybranym kanale')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            const { embed, selectMenu } = createPricelistComponents();

            if (!interaction.channel.permissionsFor(interaction.client.user).has(['SendMessages', 'ViewChannel'])) {
                await interaction.reply({
                    embeds: [EmbedMessages.error('Bot nie ma wymaganych uprawnień na tym kanale!')],
                    ephemeral: true
                });
                return;
            }

            try {
                const message = await interaction.channel.send({
                    embeds: [embed],
                    components: [new ActionRowBuilder().addComponents(selectMenu)]
                });


                await interaction.reply({ 
                    embeds: [EmbedMessages.success('Cennik został pomyślnie ustawiony na tym kanale!')],
                    ephemeral: true 
                });
            } catch (error) {
                console.error('Błąd podczas wysyłania cennika:', error);
                await interaction.reply({ 
                    embeds: [EmbedMessages.error('Wystąpił błąd podczas wysyłania cennika!')],
                    ephemeral: true 
                });
            }
        } catch (error) {
            console.error('Błąd podczas tworzenia komponentów cennika:', error);
            await interaction.reply({ 
                embeds: [EmbedMessages.error('Wystąpił błąd podczas przygotowywania cennika!')],
                ephemeral: true 
            });
        }
    },
}; 