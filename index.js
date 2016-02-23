(function() {
    "use strict";

    var http = require("http");
    var through2 = require('through2');
    var querystring = require('querystring');

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
		var site = 'packer.50x.eu';
		var req = http.get({
				hostname: site,
				port: 80,
				path: '/'
			},
			function (res) {
				
			}
		);
		
        req.on('error', function(error) {
            return typeof cb === 'function' ? cb(error) : void 0;
        });
		return req.end();
	};

    module.exports = function(options) {
        return through2.obj(function(file, encoding, callback) {
            if (file.isNull()) {
                this.push(file);
                return callback();
            }
            if (file.isStream()) {
                return callback(new Error("gulp-packer50x: Streaming not supported"));
            }
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
