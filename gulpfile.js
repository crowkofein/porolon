
// //первый способ создания таска

// function defaultTask (cb){
//     console.log('hello, Genadiy-pony');


//     cb();
// }

// function noDefaultTask(cb){
//     console.log(5*5);
//     console.log('sfgsgfdsgsf');

//     cb();
// }

// //тут каждому таску присваеваем функцию ,которую он должен выполнить

// exports.default = defaultTask;
// exports.sayHello = noDefaultTask;



//второй способ

const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();
const imageMin = require('gulp-imagemin')
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const notify = require("gulp-notify");


const pass = {
    src: {
        baseDir: './src/**/*.*',
        scss: './src/scss/app.scss',
        html: './src/**/*.html',
        js: './src/js/**/*.js',
        img: './src/img/**/*.*'
    },
    build: {
        baseDir: './build/',
        css: './build/css/',
        html: './build/',
        js: './build/js/',
        img: './build/img/'
    },
}


// function copyStyle(cb) {

//     gulp.src('./src/scss/app.scss')
//         .pipe(gulp.dest('./build/css'))

//     cb();
// }

// gulp.task('copyStyle', copyStyle);



function compileStyle(cb) {
    gulp.src(pass.src.scss)
        .pipe(sourcemaps.init())
        .pipe(autoprefixer())
        .pipe(sass({
            outputStyle: "compressed",
            errLogToConsole: true,
        }))
        // .on('error', console.error.bind(console))
        .on('error', notify.onError({
            message:"<%= error.message %> abida",
            title: "SCSS ERROR!!!"
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(pass.build.css))
        .pipe(notify({
            message: 'complete',
            sound: true,
            onLast: true
        }))

    cb();
}

gulp.task('compileStyle', compileStyle);



function buildHtml(cb) {

    gulp.src(pass.src.html)
        .pipe(gulp.dest(pass.build.html))

    cb();
}

gulp.task('buildHtml', buildHtml);



function buildJs(cb) {

    gulp.src(pass.src.js)
        .pipe(gulp.dest(pass.build.js))

    cb();
}

gulp.task('buildJs', buildJs);



function imageTransfer(cb) {

    gulp.src(pass.src.img)
        .pipe(gulp.dest(pass.build.img))

    cb();
}

gulp.task('imageTransfer', imageTransfer);


//оптимизация изображений,в вотчер не добавляем
function imageOptimize(cb) {

    gulp.src(pass.src.img)

        .pipe(imageMin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [{ removeViewBox: false }]
        }))
        .pipe(gulp.dest(pass.build.img));


    cb();
}

gulp.task('imageOptimize', imageOptimize);


//wather tasks to start task on change

function watchFiles(cb) {

    gulp.watch(pass.src.scss, compileStyle);
    gulp.watch(pass.src.html, buildHtml);
    gulp.watch(pass.src.js, buildJs);
    gulp.watch(pass.src.img, imageTransfer);
    gulp.watch(pass.src.baseDir, reload);

    cb();
}

function sync(cb) {
    browserSync.init({
        server: {
            baseDir: pass.build.baseDir
        },
        port: 3000
    })

    cb();
}


function reload(cb) {
    browserSync.reload();
    cb();
}


gulp.task('default', gulp.series(devBuild, gulp.parallel(sync, watchFiles)))

// gulp.task(cb)Build
function build(cb) {
    buildHtml(cb);
    buildJs(cb);
    compileStyle(cb);
    imageOptimize(cb);

    cb();
}

gulp.task('build', build);


function devBuild(cb) {
    buildHtml(cb);
    buildJs(cb);
    compileStyle(cb);
    imageTransfer(cb);

    cb();
}

gulp.task('devBuild', devBuild);

//====== можно использовать для случаевб когда нет возможности зазвернуть локальгл сайт.
// но нужно сделать правки во фронтенде(js/css)

// proxy: вписываем ссылку на сайт ,с которым хотим работать 
// files: непосрежственно файл или файлы ,которые будем использовать 
// middleware: указали корневую папку
// rewriteRules - указали где и что нужно добавить,
// в нашем случае перед закрытием тега Head добавили подключение стилей

const browserSyncServer = require('browser-sync');

function server(cb) {
    browserSyncServer({
        proxy: "https://beetroot.academy/",
        files: "./build/css/app.min.css",
        middleware: require('serve-static')('./build/'),
        rewriteRules: [
            {
                match: new RegExp('</head>'),
                fn: function () {
                    return '<link rel="stylesheet" href="css/app.min.css">'
                }
            }
        ],
        port: 9001
    })
}

gulp.task('server', server)



/////////////////////////////////////////////////////////////////
