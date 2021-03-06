//const sch = require('../util/soundcloudHandler.js');
const Client = require('./util/client.js');
const superagent = require('superagent');
const fs = require('fs');
require('dotenv').config()

const client = new Client(require('./src/config.json'), {
    disableEvents: ['GUILD_BAN_ADD', 'GUILD_BAN_REMOVE', 'MESSAGE_DELETE', 'MESSAGE_DELETE_BULK', 'MESSAGE_UPDATE', 'PRESENCE_UPDATE', 'TYPING_START', 'USER_UPDATE'],
    messageLimit: 0,
    maxShards: 'auto'
});

//sch.updateClientID();

client.on('ready', async () => {
    client.log('INFO', `Ready! (User: ${client.user.username})`);
});

/*client.on('guildCreate', async (g) => {
    if (g.members.filter(m => m.bot).length / g.members.size >= 0.60) {
        return g.leave();
    }
});*/

client.on('guildDelete', async (g) => {
    client.getAudioPlayer(g.id).destroy();
});

client.on('messageCreate', async (msg) => {
  	    const DEFAULTPREFIX = 'my!';
  let prefix = DEFAULTPREFIX;
 
   // var prefixes = "my!";
    client.prefix = prefix
  
    if (msg.channel.type === 1 || msg.author.bot || msg.member && msg.member.isBlocked) {
        return;
    }

    if (msg.mentions.find(m => m.id === client.user.id) && msg.content.toLowerCase().includes('help')) {
        return msg.channel.createMessage({ embed: {
            color: client.config.options.embedColour,
            title: `Use ${client.config.options.prefix}help for commands`
        } });
    }
    
    if (!msg.content.startsWith(prefix) || !msg.channel.hasPermissions(client.user.id, 'sendMessages', 'embedLinks')) {
        return;
    }

    let [command, ...args] = msg.content.slice(prefix.length).split(' '); // eslint-disable-line
    client.log('INFO', `${msg.author.username} > ${msg.content}`);

    if (client.aliases.has(command)) {
        command = client.aliases.get(command);
    }

    if (!client.commands.has(command)) {
        return;
    }

    try {
        await client.commands.get(command).run({ client, msg, args });
    } catch(e) {
        msg.channel.createMessage({ embed: {
            color: client.config.options.embedColour,
            title: `${command} failed`,
            description: 'The command failed to run. The error has been logged.'
        } });
        client.log('ERROR', e.message, e.stack.split('\n'));
    }
});

client.connect();
process.on('unhandledRejection', e =>  console.error(e))
