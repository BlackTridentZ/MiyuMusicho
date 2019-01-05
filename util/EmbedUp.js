class EmbedUp {
	constructor(data = {}) {
		Object.assign(this, data);
		this.fields = data.fields || [];
	}
	
	setAuthor(name, icon, url) {
		this.author = { name, icon_url: icon, url };
		return this;
	}
  
  setTitle(title) {
    title = resolveString(title);
    if (title.length > 256) throw new RangeError('RichEmbed titles may not exceed 256 characters.');
    this.title = title;
    return this;
  }
  
  setUrl(url) {
        this.url = url;
        return this;
    }
	
	setColor(color){
		this.color = color;
		return this;
	}
	
	setDescription(desc) {
		this.description = desc.toString().substring(0, 2048);
		return this;
	}
	
	addField(name, value, inline = false) {
    if (this.fields.length >= 25) return this;
    name = resolveString(name);
    if (name.length > 256) throw new RangeError('Field names may not exceed 256 characters.');
    if (!/\S/.test(name)) throw new RangeError('Field names may not be empty.');
    value = resolveString(value);
    if (value.length > 1024) throw new RangeError('Field values may not exceed 1024 characters.');
    if (!/\S/.test(value)) throw new RangeError('Field values may not be empty.');
    this.fields.push({ name, value, inline });
    return this;
  }
  
	setFile(file){
		this.file = file;
		return this;
	}
	
	setFooter(text, icon){
		this.footer = { text: text.toString().substring(0, 2048), icon_url: icon };
		return this;
	}
  
  setTimestamp(timestamp = new Date()) {
        this.timestamp = timestamp ? timestamp : new Date();
        return this;
    }
	
	setImage(url){
		this.image = { url };
		return this;
	}
	
	setThumbnail(url){
		this.thumbnail = { url };
		return this;
	}
}

module.exports = EmbedUp;

function resolveString(data) {
  if (typeof data === 'string') return data;
  if (data instanceof Array) return data.join('\n');
  return String(data);
}
