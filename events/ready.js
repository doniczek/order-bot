module.exports = {
    name: 'ready',
    type: 'once', // event wykona się tylko raz
    execute(client) {
        console.log(`Zalogowano jako ${client.user.tag}!`);
    },
}; 