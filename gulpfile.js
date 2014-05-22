var gulp = require('gulp'),
    rjs = require('gulp-requirejs');

gulp.task('default', function() {
    rjs({
        baseUrl: 'src/',
        name: '../node_modules/almond/almond',
        include: ['joga'],
        wrap: true,
        insertRequire: ['joga'],
        out: 'joga.js'
    })
    .pipe(gulp.dest('./dist/'));
});
