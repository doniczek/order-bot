const express = require('express');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const app = express();

app.use(bodyParser.json());

const VALID_REWARDS = ['VIP', 'SVIP', 'MVIP', 'EVIP'];

const validateReward = body('reward')
    .isString()
    .isIn(VALID_REWARDS)
    .withMessage('Nieprawidłowy typ nagrody');

const validateDiscordNick = body('discordNick')
    .isString()
    .trim()
    .isLength({ min: 2, max: 32 })
    .matches(/^[a-zA-Z0-9_#]+$/)
    .withMessage('Nieprawidłowy nick Discord');

const validateMinecraftNick = body('minecraftNick')
    .isString()
    .trim()
    .isLength({ min: 3, max: 16 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Nieprawidłowy nick Minecraft');

app.post('/assign-reward', [
    validateDiscordNick,
    validateMinecraftNick,
    validateReward
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { discordNick, minecraftNick, reward } = req.body;

        // Tutaj dodaj logikę przyznawania nagrody
        // Na przykład: wywołanie komendy na serwerze Minecraft
        // lub zapis do bazy danych

        console.log(`Przyznano nagrodę ${reward} dla gracza ${minecraftNick} (Discord: ${discordNick})`);

        res.status(200).json({
            success: true,
            message: 'Nagroda została przyznana pomyślnie',
            data: {
                discordNick,
                minecraftNick,
                reward,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Błąd podczas przyznawania nagrody:', error);
        res.status(500).json({
            success: false,
            message: 'Wystąpił błąd podczas przyznawania nagrody'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serwer API działa na porcie ${PORT}`);
}); 