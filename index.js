var through = require('through2');
var PluginError = require('gulp-util').PluginError;
var http = require('http');
var querystring = require('querystring');

// consts
var PLUGIN_NAME = 'gulp-packer50x';

function unescapeHTML(str) {
	var escapeChars;
	if (str == null) {
		return "";
	}
	escapeChars = {
		lt: '<',
		gt: '>',
		quot: '"',
		apos: "'",
		amp: '&'
	};
	return String(str).replace(/\&([^;]+);/g, function(entity, entityCode) {
		var match;
		match = void 0;
		if (entityCode in escapeChars) {
			return escapeChars[entityCode];
		} else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
			return String.fromCharCode(parseInt(match[1], 16));
		} else if (match = entityCode.match(/^#(\d+)$/)) {
			return String.fromCharCode(~~match[1]);
		} else {
			return entity;
		}
	});
};

module.exports = function(options) {
	options = options ? options : {};
	return through.obj(function(file, encoding, callback) {

		if (file.isNull()) {
			// nothing to do
			return callback(null, file);
		} else if (file.isStream()) {
			// file.contents is a Stream - https://nodejs.org/api/stream.html
			this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));

			// or, if you can handle Streams:
			//file.contents = file.contents.pipe(...)
			//return callback(null, file);
		} else if (file.isBuffer()) {
			// file.contents is a Buffer - https://nodejs.org/api/buffer.html

			switch (options.mode) {
				case 'none': options.mode = 0; break;
				case 'numeric': options.mode = 10; break;
				case undefined:
				case 'normal': options.mode = 62; break;
				case 'extended': options.mode = 95; break;
				default:
					return this.emit('error', new PluginError(PLUGIN_NAME, 'Invalid value passed to mode, must be "none", "numeric", "normal", "extended", or `undefined`. If `undefeind` it will default to "normal".'));
			}

			var postData = querystring.stringify({
				src: String(file.contents),
				mode: options.mode
			});
			var req = http.request(
				{
					hostname: 'packer.50x.eu',
					port: 80,
					path: '',
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						'Content-Length': postData.length
					}
				},
				res => {
					console.log(`STATUS: ${res.statusCode}`);
					// console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
					res.setEncoding('utf8');
					var body = [];
					res.on('data', chunk => {
						// console.log(`BODY: ${chunk}`);
						body.push(chunk);
					});
					res.on('end', () => {
						body = body.join('');
						// console.log('No more data in response. body:', body);
						var obfuscated_match = /id="packed"[\s\S]*?>([\s\S]*?)<\/textarea/m.exec(body);
						if (!obfuscated_match) {
							return this.emit('error', new PluginError(PLUGIN_NAME, 'Could not extract result from webpage, the packer.50x.eu site probably changed its HTML. Email noitidart he will fix it.'));
						}
						// console.log('obfuscated_match:', obfuscated_match.length);
						var obfuscated = unescapeHTML(obfuscated_match[1]);

						// or, if you can handle Buffers:
						file.contents = new Buffer(obfuscated);
						callback(null, file);
					});
				}
			);
			req.write(postData);
			req.on('error', e => console.log(`Got error: ${e.message}`));
			req.end();
		}
	});
};
