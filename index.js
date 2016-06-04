var through = require('through2'); // npm install --save through2
var PluginError = require('gulp-util').PluginError;
// consts
var PLUGIN_NAME = 'gulp-packer50x';

module.exports = function() {
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

        	// or, if you can handle Buffers:
        	file.contents = new Buffer(String(file.contents).replace('gConfig', 'RAWWWWWR'));
        	return callback(null, file);
        }
	});
};
