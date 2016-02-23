(function() {
    "use strict";

    var http = require("http");
    var through = require('through2');
    var querystring = require('querystring');

	// rev1 - https://gist.github.com/Noitidart/c4ab4ca10ff5861c720b
	function validateOptionsObj(aOptions, aOptionsDefaults) {
		// ensures no invalid keys are found in aOptions, any key found in aOptions not having a key in aOptionsDefaults causes throw new Error as invalid option
		for (var aOptKey in aOptions) {
			if (!(aOptKey in aOptionsDefaults)) {
				console.error('aOptKey of ' + aOptKey + ' is an invalid key, as it has no default value, aOptionsDefaults:', aOptionsDefaults, 'aOptions:', aOptions);
				throw new Error('aOptKey of ' + aOptKey + ' is an invalid key, as it has no default value');
			}
		}
		
		// if a key is not found in aOptions, but is found in aOptionsDefaults, it sets the key in aOptions to the default value
		for (var aOptKey in aOptionsDefaults) {
			if (!(aOptKey in aOptions)) {
				aOptions[aOptKey] = aOptionsDefaults[aOptKey];
			}
		}
	}
	
    var unescapeHTML = function(str) {
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

	var pack = function(source, options, cb) {
        
		if (!options) { options = {} }
		var cOptionsDefaults = {
			mode: 'normal'
		};
		
		var ex;
		try {
			validateOptionsObj(options, cOptionsDefaults);
		} catch(ex) {
			return cb(new Error("gulp-packer50x: Invalid field name passed to options, see readme"));
		}
		
		switch (options.mode) {
			case 'none':
					options.mode = 0;
				break;
			case 'numeric':
					options.mode = 10;
				break;
			case 'normal':
					options.mode = 62;
				break;
			case 'extended':
					options.mode = 95;
				break;
			default:
				return cb(new Error("gulp-packer50x: Invalid value passed to mode, see readme"));
		}
		
        var site = "packer.50x.eu";

		var qr = querystring.stringify({
			src: source,
			mode: options.mode
		});
		var req2 = http.request({
			hostname: site,
			port: 80,
			path: "",
			method: "POST",
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}, function(res) {
			res.setEncoding("utf8");
			var data = "";
			res.on("data", function(chunk) {
				return data += chunk;
			});
			return res.on("end", function() {
				var code, ex;
				try {
					code = /id="packed"[^>]+>([\s\S]+)<\/textarea>/.exec(data);
					if (!code) {
						throw new Error("gulp-packer50x: Failed to extract data from http://packer.50x.eu")
					} else {
						code = code[1];
					}
					return typeof cb === "function" ? cb(null, code) : void 0;
				} catch (_error) {
					ex = _error;
					return typeof cb === "function" ? cb(ex) : void 0;
				}
			});
		});
		req2.on("error", function(error) {
			return typeof cb === "function" ? cb(error) : void 0;
		});
		req2.write(qr);
		return req2.end();
	};

    module.exports = function(options) {
        return through.obj(function(file, encoding, callback) {
			// Pass file through if:
			// - file has no contents
			// - file is a directory
			if (file.isNull() || file.isDirectory()) {
				this.push(file);
				return callback();
			}
			
			// No support for streams
			// Error if
			// - file is a stream
            if (file.isStream()) {
                return callback(new Error("gulp-packer50x: Streaming not supported"));
            }
			
			// file.contents = 'rawr';
			// this.push(file);
			// return callback();
			
            return pack(file.contents.toString(encoding), options, (function(_this) {
                return function(error, data) {
                    if (error != null) {
                        return callback(error);
                    }
                    file.contents = new Buffer(data);
                    _this.push(file);
                    return callback();
                };
            })(this));
        });
    };

    module.exports.pack = pack;

}).call(this);