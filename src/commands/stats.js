const timeParser  = require('../../util/timeParser.js');
const { version } = require('../../package.json');
const cpuStat  = require("cpu-stat")
const os = require("os")

exports.run = async function ({ client, msg , args}) {
    const playing = client.voiceConnections.filter(vc => vc.playing).length;
    const paused  = client.voiceConnections.size - playing;

if (!args[0]) return;
	
if (args[0] === "-m") {
cpuStat.usagePercent(function(err, percent, seconds) { if (err) { return console.log(err); }
    msg.channel.createMessage({ embed: {
        color: client.config.options.embedColour,
        title: `Miyuki Music Bot`,
        fields: [
            { name: 'Uptime', value: timeParser.formatSeconds(process.uptime()), inline: true },
            { name: 'RAM Usage', value: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`, inline: true },
            { name: 'Library', value: 'Eris (Dev)',	inline: true },
            { name: 'Streams', value: `► Playing ${playing} | ❚❚ Paused ${paused}`, inline: true },
            { name: 'Servers', value: client.guilds.size, inline: true },
            { name: 'Latency', value: `${msg.channel.guild.shard.latency}ms`, inline: true },
            { name: 'CPU', value: `${os.cpus()[0].model}`, inline: true },
            { name: 'CPU Usage', value: `${percent.toFixed(2)}% Used`, inline: true }
        ],
        footer: {
            text: `Release v1.0.0`
        }
    } });
})
}
};

exports.usage = {
    main: '{prefix}{command}',
    args: '',
    description: 'View statistics of the bot'
};
