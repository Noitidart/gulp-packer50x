# gulp-packer50x

Obfuscate JavasScript via packer.50x.eu. Please DO NOT include any sensitive data.

Installation
----
    npm install gulp-packer50x
Usage
====
<pre><code>
var packer50x = require('gulp-packer50x');

gulp.task('scripts', function() {
    gulp.src('./lib/*.js')
    .pipe(packer50x({
        mode: "normal", // (Optional - default: "normal" Possible Values - "none", "numeric", "normal", "extended")
    }))
    .pipe(gulp.dest('./dist/'));
});
</code></pre>

# License

MIT
