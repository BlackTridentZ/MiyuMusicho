const timeParser = require('../../util/timeParser.js');

exports.run = async function ({ client, msg }) {
    const audioPlayer = client.getAudioPlayer(msg.channel.guild.id);
    if (!audioPlayer.isPlaying()) {
        return msg.channel.createMessage({ embed: {
            color: client.config.options.embedColour,
            title: 'There\'s nothing playing'
        } });
    }

    const track = audioPlayer.current;
    const { current } = client.voiceConnections.get(msg.channel.guild.id);
    const progBar = getProgressBar(audioPlayer)

    const embed = new client.EmbedUp()
        .setColor(client.config.options.embedColour)
        .setThumbnail(`https://i.ytimg.com/vi/${track.id}/default.jpg?width=80&height=60`)
        .setTitle('<a:MusicNotes:489099234461745163> Now Playing')
        .setDescription(`[${track.title}](${track.permalink})\n` + 
        `**\`${timeParser.formatSeconds(current.playTime / 1000)}\` ${progBar} \`${timeParser.formatSeconds(track.duration / 1000)}\`**`)
        .setFooter(`Requested by ${client.users.has(track.req) ? client.users.get(track.req).username : 'Unknown'}`)

    function getProgressBar (audioPlayer) {
        const { current } = client.voiceConnections.get(msg.channel.guild.id);
        const duration = (audioPlayer.current.duration);
          const percent = current.playTime/duration;
          const num = Math.floor(percent*12);
          let str = '';
          for(let i = 0; i < 12; i++){
              str += i === num ? '🔘' : '▬';
        }
          return str;
      }

    msg.channel.createMessage({ embed });

};

exports.usage = {
    main: '{prefix}{command}',
    args: '',
    description: 'Shows info about the currently playing song'
};

exports.aliases = ['n', 'np'];
