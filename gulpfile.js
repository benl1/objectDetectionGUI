var gulp = require('gulp');
var babel = require('gulp-babel');
var spawn = require('child_process').spawn;

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

gulp.task('scene-selection-screen', () => {
    return gulp.src('src/scene_selection_screen/*.jsx')
        .pipe(babel({
            plugins: ['transform-react-jsx']
        }))
        .pipe(gulp.dest('dist/scene_selection_screen/'));
});

gulp.task('output-screen', () => {
    return gulp.src('src/output_screen/*.jsx')
        .pipe(babel({
            plugins: ['transform-react-jsx']
        }))
        .pipe(gulp.dest('dist/output_screen/'));
});

gulp.task('control', () => {
    return gulp.src('src/control/*.jsx')
        .pipe(babel({
            plugins: ['transform-react-jsx']
        }))
        .pipe(gulp.dest('dist/control/'));
});

gulp.task('transpile',
    gulp.series('entrypoint', 'image-choice-screen', 'scene-selection-screen', 'output-screen', 'control'),
    (done) => done()
);