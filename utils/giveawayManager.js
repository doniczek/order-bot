const { EmbedBuilder } = require('discord.js');
const config = require('../config/config.json');

class GiveawayManager {
    static #instance;
    #giveaways = new Map();

    constructor() {
        if (GiveawayManager.#instance) {
            return GiveawayManager.#instance;
        }
        GiveawayManager.#instance = this;
    }

    getGiveaway(messageId) {
        return this.#giveaways.get(messageId);
    }

    saveGiveaway(messageId, data) {
        this.#giveaways.set(messageId, data);
    }

    deleteGiveaway(messageId) {
        this.#giveaways.delete(messageId);
    }

    static getInstance() {
        if (!GiveawayManager.#instance) {
            GiveawayManager.#instance = new GiveawayManager();
        }
        return GiveawayManager.#instance;
    }
}

module.exports = GiveawayManager; 