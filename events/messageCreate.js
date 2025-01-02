module.exports = {
    name: 'messageCreate',
    type: 'on', // event będzie się wykonywał za każdym razem
    execute(message, client) {
        if (message.author.bot) return;
        // obsługa wiadomości
    },
}; 