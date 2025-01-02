const { EmbedBuilder } = require('discord.js');
const config = require('../config/config.json');

class EmbedMessages {
    static success(message) {
        return new EmbedBuilder()
            .setColor(config.colors.success)
            .setDescription(`${config.emojis.success} ${message}`)
            .setTimestamp();
    }

    static error(message) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(`${config.emojis.error} ${message}`)
            .setTimestamp();
    }

    static warning(message) {
        return new EmbedBuilder()
            .setColor(config.colors.warning)
            .setDescription(`${config.emojis.warning} ${message}`)
            .setTimestamp();
    }
}

module.exports = EmbedMessages; 