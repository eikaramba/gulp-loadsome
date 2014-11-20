var through = require("through2"),
	gutil = require("gulp-util");

    var crypto = require("crypto");
    var async = require("async");
    var request = require("request");
    var path = require("path");
    var _ = require('lodash');
    var fs = require('fs');
    var mkdirp = require('mkdirp');
    var zlib = require('zlib');

	module.exports = function (options) {
	"use strict";

	if (!options.downloadPath) {
		throw new gutil.PluginError("gulp-loadsome", "Options 'downloadPath' required");
	}
	if (!options.relativePathFromDest) {
		options.relativePathFromDest="";
	}else{
		if(options.relativePathFromDest.slice(-1)!="/"){
			options.relativePathFromDest = options.relativePathFromDest + "/";
		}
	}

	function md5(content, algorithm, encoding) {
		var hash = crypto.createHash(algorithm);
		hash.update(content);
		return hash.digest(encoding);
	}

	function loadsome(file, enc, callback) {
		/*jshint validthis:true*/

		var that = this;
		// Do nothing if no contents
		if (file.isNull()) {
			this.push(file);
			return callback();
		}

		if (file.isStream()) {

			// http://nodejs.org/api/stream.html
			// http://nodejs.org/api/child_process.html
			// https://github.com/dominictarr/event-stream

			// accepting streams is optional
			this.emit("error", new gutil.PluginError("gulp-loadsome", "Stream content is not supported"));
			return callback();
		}

		// check if file.contents is a `Buffer`
		if (file.isBuffer()) {

			var replaceOrders = [];

			// manipulate buffer in some way
			var content = file.contents.toString();

			var pattern = /<script.+src=['"]([^"']+loadso\.me)([^"']+)["']/gm;
			var result;

			//Now find every occurence of loadsome and save them into our object. Then we can use this to schedule the downloads and replace the references with the downloaded files
			async.whilst(
				function () { return result = pattern.exec(content); },
				function (nextReplace) {
					var replaceOrder = {};
					replaceOrder.path = result[2];
					replaceOrder.replace = result[1]+result[2];
					replaceOrder.filetype = replaceOrder.path.split(".").pop();
					if(replaceOrder.filetype.indexOf('~')!=-1){ //remove token for final filename, only relevant for http call
                        replaceOrder.filetype = replaceOrder.filetype.substr(0, replaceOrder.filetype.indexOf('~'));
                    }
					gutil.log("found & download: " + gutil.colors.cyan(replaceOrder.replace));

					request({
						url: "https://loadso.me"+replaceOrder.path,
						headers: {
        					'Accept': 'text/plain, application/javascript, text/css',
                            'Referer': 'loadsomeTask'
    					},
    					gzip: true
    				},
    				function(err, response, downloadedContent) {
						if (response.statusCode !== 200 || err) {
							if(response.statusCode === 429) {
	                            gutil.log(gutil.colors.red('Too many requests, please report this us so that we can adapt the timeout or implement a additional option to include a token for unlimited requests!'));
	                        } else {
	                            gutil.log(gutil.colors.red('Download failed:' + err));
	                        }
							setTimeout(function(){ nextReplace(err); }, 1150); //TODO: Add token option so that more concurrent calls can be made
						}else{
							var hash = md5(downloadedContent, "md5", "hex");
							var assetPath = options.downloadPath+"/"+hash+"."+replaceOrder.filetype;
							var assetdirectory = path.dirname(assetPath);
							
							if (!fs.existsSync(assetdirectory)) {
							    mkdirp.sync(assetdirectory);
							}

							fs.writeFile(assetPath, downloadedContent, function (err) {
								if (err){
									gutil.log("error:"+err);
									setTimeout(function(){ nextReplace(err); }, 1150);
								}else{
									gutil.log("Downloaded loadsome file written to "+assetPath);

									replaceOrder.newPath = options.relativePathFromDest + path.basename(assetPath); //TODO: Try to find the destination and automatically find the correct path
									replaceOrders.push(replaceOrder);
									setTimeout(function(){ nextReplace(err); }, 1150); //TODO: Add token option so that more concurrent calls can be made
								}
							});
						}
					});
					
				},
				function (err) {
					if (err) {
						gutil.log("failed:" + err);
					}
					_.forEach(replaceOrders,function(order){
						content = content.replace(new RegExp('(<script.+src=[\'"])'+order.replace+'(["\'])','gm'),'$1'+order.newPath+'$2');
					});
					
					file.contents = new Buffer(String(content));

					that.push(file);

					return callback();
				}
			);

		}
		
	}

	return through.obj(loadsome);
};
