<div style="text-align:center"><img src="https://www.loadso.me/static/assets/images/logo.png"></div>

# gulp-loadsome
[![NPM version](https://nodei.co/npm/gulp-loadsome.png?compact=true)](https://nodei.co/npm/gulp-loadsome/) [![Build Status](https://travis-ci.org/eikaramba/gulp-loadsome.svg)](https://travis-ci.org/eikaramba/gulp-loadsome) [![dependencies](https://david-dm.org/eikaramba/gulp-loadsome.png)](https://david-dm.org/eikaramba/gulp-loadsome)

> loadsome plugin for [gulp](https://github.com/wearefractal/gulp)

## Usage

First, install `gulp-loadsome` as a development dependency:

```shell
npm install --save-dev gulp-loadsome
```

Then, add it to your `gulpfile.js`:

```javascript
var loadsome = require("gulp-loadsome");

gulp.src("./src/*.ext")
	.pipe(loadsome({
		"downloadPath":".tmp",
		"relativePathFromDest":"../"
	}))
	.pipe(gulp.dest("./dist"));
```

## API

### loadsome(options)

#### options.downloadPath
Type: `String`  

Path to the folder, where all the ressources should be downloaded to. This folder should be accessible from your html files, so that the link references inside the html files can point to this new location.

#### options.relativePathFromDest
Type: `String`  

This is the path to the download folder as seen from the destination folder(where the final html files are written). As the destination folder is not known for the plugin, you need to give the plugin this information, so that the references from the html files will later match to the actual downloaded files. e.g. if the html is located at `/output/client/final.html` and the downloadPath is `/output/assets`, then relativePathFromDest needs to be `../assets/`.

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)