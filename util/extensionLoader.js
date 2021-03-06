function loadExtensions (Eris) {
    Object.defineProperties(Eris.Member.prototype, {
        'isBlocked': {
            get () {
                return this.guild.roles.find(r => r.name === 'MiyukiBlackList' && this.roles.includes(r.id)); // TODO: Link this into config for global blacklists?
            }
        },
        'isAdmin': {
            get () {
                return this.guild.roles.find(r => r.name === 'DJ' && this.roles.includes(r.id)) || this.id === '304377187057008645'; // TODO: Link this into config
            }
        }
    });

    Object.defineProperty(Eris.GuildChannel.prototype, 'hasPermissions', {
        value (user, ...permissions) {
            let check = true;
            for (const permission of permissions) {
                if (!this.permissionsOf(user).has(permission)) {
                    check = false;
                    break;
                }
            }
            return check;
        }
    });

    Object.defineProperty(Eris.VoiceConnectionManager.prototype, 'isConnected', {
        value (guildId) {
            return this.has(guildId) && this.get(guildId).channelID !== null;
        }
    });

    return Eris;
}

module.exports = loadExtensions;
