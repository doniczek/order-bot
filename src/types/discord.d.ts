import { Client } from 'discord.js';

declare module 'discord.js' {
    interface Client {
        verificationCodes: Map<string, {
            userId: string;
            minecraftNick: string;
            timestamp: number;
            used: boolean;
        }>;
    }
} 