const TICKET_TYPES = {
    HELP: {
        id: 'help',
        name: 'Pomoc',
        emoji: '❓',
        description: `
📝 **Potrzebujesz pomocy?**
Kliknij przycisk poniżej, aby otworzyć ticket!

ℹ️ **Informacje:**
• Ticket zostanie utworzony w osobnym kanale
• Dostęp do ticketu będą mieli tylko Ty i administracja
• Prosimy o cierpliwość w oczekiwaniu na odpowiedź`,
        category: 'TICKETY'
    },
    SERVICES: {
        id: 'services',
        name: 'Usługi',
        emoji: '🛍️',
        description: `
💼 **Zainteresowany naszymi usługami?**
Kliknij przycisk poniżej, aby omówić szczegóły zamówienia!

📌 **Dostępne usługi:**
• Boty Discord
• Pluginy Minecraft
• Grafiki i rendery
• Strony internetowe

ℹ️ **Informacje:**
• Przedstaw dokładnie swoje oczekiwania
• Podaj budżet i termin realizacji
• Dołącz przykłady jeśli to możliwe`,
        category: 'ZAMÓWIENIA'
    }
};

module.exports = TICKET_TYPES; 