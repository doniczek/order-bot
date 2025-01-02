module.exports = {
    rewards: {
        VIP: {
            duration: 30, // dni
            commands: [
                'lp user {minecraftNick} parent add vip',
                'broadcast {minecraftNick} otrzymał rangę VIP!'
            ]
        },
        SVIP: {
            duration: 30,
            commands: [
                'lp user {minecraftNick} parent add svip',
                'broadcast {minecraftNick} otrzymał rangę SVIP!'
            ]
        },
        MVIP: {
            duration: 30,
            commands: [
                'lp user {minecraftNick} parent add mvip',
                'broadcast {minecraftNick} otrzymał rangę MVIP!'
            ]
        },
        EVIP: {
            duration: 30,
            commands: [
                'lp user {minecraftNick} parent add evip',
                'broadcast {minecraftNick} otrzymał rangę EVIP!'
            ]
        }
    }
}; 