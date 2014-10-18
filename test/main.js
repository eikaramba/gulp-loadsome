/*global describe, it*/
"use strict";

var fs = require("fs"),
	es = require("event-stream"),
	should = require("should");

require("mocha");

delete require.cache[require.resolve("../")];

var gutil = require("gulp-util"),
	loadsome = require("../");

describe("gulp-loadsome", function () {

	var expectedFile = new gutil.File({
		path: "test/expected/testing.html",
		base: "test/expected",
		contents: fs.readFileSync("test/expected/testing.html")
	});

	var expectedFile2 = new gutil.File({
		path: "test/expected/testing2.html",
		base: "test/expected",
		contents: fs.readFileSync("test/expected/testing2.html")
	});

	it("should replace loadsome references", function (done) {

		var srcFile = new gutil.File({
			path: "test/fixtures/testing.html",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.readFileSync("test/fixtures/testing.html")
		});

		var stream = loadsome({
			"downloadPath":"test/.tmp",
			"relativePathFromDest":".tmp"
		});

		stream.on("error", function(err) {
			should.exist(err);
			done(err);
		});

		stream.on("data", function (newFile) {

			should.exist(newFile);
			should.exist(newFile.contents);

			String(newFile.contents).should.equal(String(expectedFile.contents));
			done();
		});

		stream.write(srcFile);
		stream.end();
	});

	it("should replace loadsome references in a simple file", function (done) {

		var srcFile = new gutil.File({
			path: "test/fixtures/testing2.html",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.readFileSync("test/fixtures/testing2.html")
		});

		var stream = loadsome({
			"downloadPath":"test/.tmp",
			"relativePathFromDest":".tmp"
		});

		stream.on("error", function(err) {
			should.exist(err);
			done(err);
		});

		stream.on("data", function (newFile) {

			should.exist(newFile);
			should.exist(newFile.contents);

			String(newFile.contents).should.equal(String(expectedFile2.contents));
			done();
		});

		stream.write(srcFile);
		stream.end();
	});

	it("should error on stream", function (done) {

		var srcFile = new gutil.File({
			path: "test/fixtures/testing.html",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.createReadStream("test/fixtures/testing.html")
		});

		var stream = loadsome({
			"downloadPath":".tmp",
			"relativePathFromDest":"/"
		});

		stream.on("error", function(err) {
			should.exist(err);
			done();
		});

		stream.on("data", function (newFile) {
			newFile.contents.pipe(es.wait(function(err, data) {
				done(err);
			}));
		});

		stream.write(srcFile);
		stream.end();
	});

	/*
	it("should produce expected file via stream", function (done) {

		var srcFile = new gutil.File({
			path: "test/fixtures/hello.txt",
			cwd: "test/",
			base: "test/fixtures",
			contents: fs.createReadStream("test/fixtures/hello.txt")
		});

		var stream = loadsome("World");

		stream.on("error", function(err) {
			should.exist(err);
			done();
		});

		stream.on("data", function (newFile) {

			should.exist(newFile);
			should.exist(newFile.contents);

			newFile.contents.pipe(es.wait(function(err, data) {
				should.not.exist(err);
				data.should.equal(String(expectedFile.contents));
				done();
			}));
		});

		stream.write(srcFile);
		stream.end();
	});
	*/
});
