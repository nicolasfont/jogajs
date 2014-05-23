var gulp = require('gulp'),
    qunit = require('gulp-qunit'),
    rjs = require('gulp-requirejs'),
    header = require('gulp-header'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),

    version = '0.2.0pre',
    year = new Date().getFullYear(),
    banner = [
        '// JogaJS v<%= version %>',
        '// (c) <%= year %> Nicolas Font http://jogajs.com',
        '// License: MIT',
        ''
    ].join('\n');

gulp.task('build', function () {
    rjs({
        baseUrl: 'src/',
        name: '../node_modules/almond/almond',
        include: ['joga'],
        wrap: true,
        insertRequire: ['joga'],
        out: 'joga.min.js'
    })
    .pipe(uglify())
    .pipe(header(banner, {version: version, year: year}))
    .pipe(gulp.dest('./'));
    
    rjs({
        baseUrl: 'src/',
        name: 'joga',
        include: ['joga'],
        wrap: true,
        out: 'joga.js'
    })
    .pipe(header(banner, {version: version, year: year}))
    .pipe(gulp.dest('./'));
});

gulp.task('test', function() {
    gulp.src('./tests/index.html')
        .pipe(qunit());
});

gulp.task('lint', function () {
    return gulp.src('./src/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('default', ['lint', 'test']);