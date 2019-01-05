const ytutil = require('../../util/youtubeHandler.js');
const scutil = require('../../util/soundcloudHandler.js');
//const sputil = require('../../util/spotifyHandler.js');

const ytrx = new RegExp('(?:youtube\\.com.*(?:\\?|&)(?:v|list)=|youtube\\.com.*embed\\/|youtube\\.com.*v\\/|youtu\\.be\\/)((?!videoseries)[a-zA-Z0-9_-]*)');
const scrx = new RegExp('(?:https?:\/\/)?(?:www\.)?soundcloud\.com\/+[a-zA-Z0-9-.]+\/+[a-zA-Z0-9-.]+');
const sprx = new RegExp('https?:\/\/(?:open\.)?spotify\.com\/track\/([a-zA-Z0-9]{22})');

exports.run = async function ({ client, msg, args }) {
    const audioPlayer = client.getAudioPlayer(msg.channel.guild.id);

    if (!args[0]) {
        return msg.channel.createMessage({ embed: {
            color: client.config.options.embedColour,
            title: 'You need to specify something',
            description: 'YouTube: Search Term, URL or Playlist URL'
        } });
    }

    if (!client.voiceConnections.isConnected(msg.channel.guild.id)) {
        if (!msg.member.voiceState.channelID) {
            return msg.channel.createMessage({ embed: {
                color: client.config.options.embedColour,
                title: 'Join a voicechannel first',
            } });
        }

        if (!client.getChannel(msg.member.voiceState.channelID).hasPermissions(client.user.id, 'voiceConnect', 'voiceSpeak')) {
            return msg.channel.createMessage({ embed: {
                color: client.config.options.embedColour,
                title: 'Unable to Connect',
                description: 'This channel doesn\'t allow me to connect/speak.'
            } });
        }

        await client.joinVoiceChannel(msg.member.voiceState.channelID)
            .catch(e => {
                msg.channel.createMessage({ embed: {
                    color: client.config.options.embedColour,
                    title: 'Unable to Connect',
                    description: e.message
                } });
            });

        if (!client.voiceConnections.isConnected(msg.channel.guild.id)) {
            return;
        }
        audioPlayer.setAnnounce(msg.channel.id);

    } else if (msg.member.voiceState.channelID !== client.voiceConnections.get(msg.channel.guild.id).channelID) {
        return msg.channel.createMessage({ embed: {
            color: client.config.options.embedColour,
            title: 'Join my voicechannel to queue.',
        } });
    }

    const query = args.join(' ').replace(/<|>/g, '');
    const ytrxm = query.match(ytrx);
    const scrxm = query.match(scrx);
    const url = ytrxm ? ytrxm[0] : scrxm ? scrxm[0] : query;

    const res = {};

    if (!ytrxm && !scrxm) {

        if (!client.config.keys.youtube) {
            if (!audioPlayer.isPlaying()) {
                client.leaveVoiceChannel(client.voiceConnections.get(msg.channel.guild.id).channelID);
            }

            return msg.channel.createMessage({ embed: {
                color: client.config.options.embedColour,
                title: 'No YouTube key specified',
                description: 'No YouTube key was configured in `config.json`. YouTube not available.'
            } });
        }

        res.src = 'youtube';
        res.type = 'search';
        res.items = await ytutil.search(query);

    } else {

        if (ytrxm && ytrxm[1]) {

            if (!client.config.keys.youtube) {
                if (!audioPlayer.isPlaying()) {
                    client.leaveVoiceChannel(client.voiceConnections.get(msg.channel.guild.id).channelID);
                }

                return msg.channel.createMessage({ embed: {
                    color: client.config.options.embedColour,
                    title: 'No YouTube key specified',
                    description: 'No YouTube key was configured in `config.json`. YouTube not available.'
                } });
            }

            res.src = 'youtube';

            if (ytrxm[1].length >= 15) {
                res.type = 'playlist';
                res.items = await ytutil.getPlaylist(ytrxm[1]);
            } else {
                res.type = 'url';
                res.items = await ytutil.videoInfo(ytrxm[1]);
            }

        } else {

            res.src = 'soundcloud';
            res.type = 'soundcloud';
            res.items = await scutil.getTrack(query);

        }

    }

    if (res.items.length === 0) {
        if (!audioPlayer.isPlaying()) {
            client.leaveVoiceChannel(client.voiceConnections.get(msg.channel.guild.id).channelID);
        }

        return msg.channel.createMessage({ embed: {
            color: client.config.options.embedColour,
            title: 'No results found.',
        } });
    }

    res.items.forEach(track => {
        track.req = msg.author.id;
        track.permalink = res.src === 'youtube' ? `https://youtube.com/watch?v=${track.id}` : url;
        track.src = res.src;
    });

    if (res.type !== 'search') {

        res.items.forEach(v => audioPlayer.add(v));

        const embed = {
            color: client.config.options.embedColour,
            title: `<:checked:531233357787561984> Enqueued ${res.items[0].title}`
        };

        if (res.type === 'playlist') {
            embed.description = `...and ${res.items.slice(1).length} songs.`;
        }

        msg.channel.createMessage({ embed });

    } else {
       let src = await msg.channel.createMessage({ embed: {
            color: client.config.options.embedColour,
            title: `Searching... "${args.join(" ")}".`,
        } });
      
        audioPlayer.add({
            id: res.items[0].id.videoId,
            title: res.items[0].snippet.title,
            req: msg.author.id,
            src: 'youtube',
            permalink: `https://youtube.com/watch?v=${res.items[0].id.videoId}`
        });

        await setTimeout(() => src.edit({ embed: {
            color: client.config.options.embedColour,
            title: `<:checked:531233357787561984> Enqueued ${res.items[0].snippet.title}`,
            thumbnail: {"url": `https://i.ytimg.com/vi/${res.items[0].id.videoId}/default.jpg?width=80&height=60`},
            description: `Requested by ${msg.author.username}#${msg.author.discriminator}`
        } }), 1000);
    }

    if (!audioPlayer.isPlaying()) {
        audioPlayer.play();
    }
};

exports.usage = {
    main: '{prefix}{command}',
    args: '<YouTube URL/Playlist/Search>',
    description: 'Play the specified song'
};

exports.aliases = ['p'];