var gulp = require('gulp');
var babel = require('gulp-babel');

// all this file is doing is transpiling the jsx files in src/ into js files in dist/

gulp.task('entrypoint', () => {
    return gulp.src('src/entrypoint.jsx')
        .pipe(babel({
            plugins: ['transform-react-jsx']
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('image-choice-screen', () => {
    return gulp.src('src/image_choice_screen/*.jsx')
        .pipe(babel({
            plugins: ['transform-react-jsx']
        }))
        .pipe(gulp.dest('dist/image_choice_screen/'));
});

gulp.task('control', () => {
    return gulp.src('src/control/*.jsx')
        .pipe(babel({
            plugins: ['transform-react-jsx']
        }))
        .pipe(gulp.dest('dist/control/'));
});