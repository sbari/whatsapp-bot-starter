# Simple WhatsApp Bot

Un bot WhatsApp simple et extensible qui répond aux commandes.

## Installation

1. Clonez le repository
```bash
git clone https://github.com/your-username/simple-whatsapp-bot.git
cd simple-whatsapp-bot
```

2. Installez les dépendances
```bash
npm install
```

3. Configurez le bot
```bash
cp config.json.example config.json
# Éditez config.json avec vos paramètres
```

4. Démarrez le bot
```bash
npm start
```

5. Scannez le QR code avec WhatsApp

## Configuration

Éditez le fichier `config.json` :

```json
{
  "prefix": "!",
  "adminNumbers": ["votre_numero"],
  "enabledCommands": ["hello", "help", "ping"]
}
```

## Commandes disponibles

- `!hello [nom]` - Salue l'utilisateur
- `!ping` - Test de connectivité
- `!help` - Liste des commandes

## Ajouter une nouvelle commande

1. Créez un fichier dans `src/commands/` (ex: `src/commands/time.js`)

```javascript
module.exports = {
  name: 'time',
  description: 'Affiche l\'heure actuelle',
  usage: '!time',
  aliases: ['heure'],
  
  async execute(message, args, client) {
    const now = new Date().toLocaleString('fr-FR');
    await message.reply(`Il est actuellement ${now}`);
  }
};
```

2. Ajoutez la commande dans `config.json`

```json
{
  "enabledCommands": ["hello", "help", "ping", "time"]
}
```

3. Redémarrez le bot

## Structure du projet

```
simple-whatsapp-bot/
├── src/
│   ├── bot.js              # Bot principal
│   ├── commands/           # Commandes
│   │   ├── hello.js
│   │   ├── help.js
│   │   ├── ping.js
│   │   └── index.js        # Gestionnaire
│   └── index.js           # Point d'entrée
├── config.json           # Configuration
├── package.json
└── README.md
```

## Exemple d'utilisation

Une fois le bot connecté, envoyez dans WhatsApp :

- `!hello` → "Salut [votre nom] ! Comment ça va ?"
- `!hello Pierre` → "Salut Pierre ! Message envoyé par [votre nom]"
- `!ping` → "Pong ! Latence: 45ms Uptime: 0h 5m 23s"
- `!help` → Liste toutes les commandes disponibles

## Licence

MIT