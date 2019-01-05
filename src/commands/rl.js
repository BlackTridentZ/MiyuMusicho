const fs = require("fs");

exports.run = async function ({client, msg, args}) {
    if (!client.config.prop.owners.includes(msg.author.id)) {
        return msg.channel.createMessage({ embed: {
            color: client.config.options.embedColour,
            title: ':warning: Restricted Command',
            description: 'This command is locked to the developer only.'
        } });
    }
  try{
    delete require.cache[require.resolve(`./${args[0]}.js`)];

    return msg.channel.createMessage(`Successfully reloaded **${args[0]}.js**`)
     }catch(e){
     return msg.channel.createMessage(`Unable to reload ${args[0]}`)
     }
}; 
exports.usage = {
    main: '{prefix}{command}',
    args: '<page>',
    description: 'View the specified queue page'
};

exports.aliases = ['rld'];