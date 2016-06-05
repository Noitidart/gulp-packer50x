# gulp-packer50x

Obfuscate JavasScript via http://packer.50x.eu. This submits the source to the website and returns the result. Contents can be piped.

## Change Log
* **v1.0.60** - This is the first version that works. All prior versions will not work.

## Installation
    npm install gulp-packer50x

## Usage
<pre><code>
var packer50x = require('gulp-packer50x');

gulp.task('scripts', function() {
    gulp.src('./lib/*.js')
    .pipe(packer50x({
        mode: "normal", // (Optional - default: "normal"; Possible Values - "none", "numeric", "normal", "extended")
    }))
    .pipe(gulp.dest('./dist/'));
});
</code></pre>

#### Options

* **`mode`** - defaults to `normal`
  * `none`
  * `numeric`
  * `normal`
  * `extended`

## License

ISC
