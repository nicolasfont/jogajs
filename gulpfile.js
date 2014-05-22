var gulp = require('gulp'),
    rjs = require('gulp-requirejs'),
    header = require('gulp-header'),
    uglify = require('gulp-uglify'),
    version = '0.1.0pre',
    year = new Date().getFullYear(),
    banner = [
        '// JogaJS v<%= version %>',
        '// (c) <%= year %> Nicolas Font http://jogajs.com',
        '// License: MIT',
        ''
    ].join('\n');

gulp.task('default', function () {
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
