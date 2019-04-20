//引入插件
var gulp = require('gulp');
var sass = require('gulp-sass');
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');  //压缩js文件大小
var pump = require('pump');
var cssmin = require('gulp-clean-css');
var cssver = require('gulp-make-css-url-version');
var imagemin = require('gulp-imagemin');  //压缩图片
var pngquant = require('imagemin-pngquant');
var cache = require('gulp-cache');
var spriter = require('gulp-css-spriter');
var autoprefixer = require('gulp-autoprefixer');
var babel = require('gulp-babel');
var fileinclude = require('gulp-file-include');
var htmlmin = require('gulp-htmlmin');
var rev = require('gulp-rev-append');
var rename = require('gulp-rename');
var filter = require('gulp-filter');
var del = require('del');
var concat = require('gulp-concat');

//路径变量
var path = {
    //开发环境
    src: {
        html: './src',
        js: './src/js',
        scss: './src/scss',
        css: './src/css',
        img: './src/img',
        font:'./src/font',
        includebase: './src/include' //include引用文件路径
    },
    //发布环境
    dist: {
        html: './dist',
        js: './dist/js',
        scss: './dist/scss',
        css: './dist/css',
        img: './dist/img',
        font:'./dist/font',
        baseroot: './dist'
    }
};



//将scss文件编译成css
gulp.task('scss', function() {
    return gulp.src(path.src.scss + '/all.scss', { style: 'nested' })
        .pipe(sass())
        .pipe(gulp.dest(path.src.css))
        .pipe(connect.reload());
});

//压缩css文件，css样式加前缀
gulp.task('css', ['scss'], function() {
    var timestamp = new Date().getTime();
    return gulp.src(path.src.css + '/*.css')
        .pipe(autoprefixer({ //给样式增加浏览器前缀
            // browsers:['last 2 versions','safari 5','ie 8', 'ie 9', 'opera 12.1','ff 15', 'ios 6','android 4'],
            browsers: ['>0.1%'],
            cascade: true, //是否美化属性值
            remove: true //是否去掉不必要的前缀 默认true
        }))
        .pipe(spriter({ //合成雪碧图
            'spriteSheet': path.dist.img + '/sprite_' + timestamp + '.png', // 生成的spriter的位置
            // 如下将生产：backgound:url(../images/sprite20324232.png)
            'pathToSpriteSheetFromCSS': './../img/sprite_' + timestamp + '.png', //生成的样式文件里面图片引用地址的路径
        }))
        // .pipe(rename({ suffix: '.min' })) // 对管道里的文件流添加 .min 的重命名
        .pipe(cssmin({
            advanced: false, //类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            compatibility: 'ie8', //保留ie8及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: true,
            keepSpecialComments: '*' //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
        }))
        .pipe(gulp.dest(path.dist.css))
        .pipe(connect.reload());
});

//压缩图片
gulp.task('image', function() {
    return gulp.src(path.src.img + '/**/*.{png,jpg,gif,ico}')
        .pipe(cache(imagemin({
            optiimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
            svgoPlugins: [{ removeViewBox: false }], //不要移除svg的viewbox属性
            use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
        })))
        .pipe(gulp.dest(path.dist.img))
});

/**
* 编译css及复制压缩图片及雪碧图后，再添加css引用文件的版本号
*/
// gulp.task('cssver',['css','image'], function(){
// 	return gulp.src(path.dist.css + '/*.css')
// 		.pipe(cssver())
// 		.pipe(gulp.dest(path.dist.css));
// });


// 压缩js文件
gulp.task('js', function(cb) {
    var jsFilter = filter('**/*.min.js', { restore: true });
    pump([
            gulp.src(path.src.js + '/*.js'),
            jsFilter,
            gulp.dest(path.dist.js), //复制*.min.js文件到dist/js中
            jsFilter.restore,
            filter(['**/*', '!**/*.min.js']), // 筛选出管道中的非 *.min.js 文件，进行压缩编译
            babel({
                presets: ['es2015']
            }),
            // rename({ suffix: '.min' }), //重命名
            // uglify(),
            gulp.dest(path.dist.js)
        ],
        cb
    );
});

//字体文件
// gulp.task('font',function(){
// 	return gulp.src(path.src.font + '/*')
// 		.pipe(gulp.dest(path.dist.font))
// 		.pipe(connect.reload());
// });

//压缩html页面，文件嵌入，页面引用文件加版本号
gulp.task('html', ['js','css','image'], function() {
    var options = {
        removeComments: true, //清除HTML注释
        collapseWhitespace: true, //压缩HTML
        collapseBooleanAttributes: true, /*省略布尔属性的值 input checked="true" ---- input */
        removeEmptyAttributes: true, /*删除所有空格作属性值 input id="" ==> input*/
        removeScriptTypeAttributes: true, /*删除script的type=text/javascript*/
        removeStyleLinkTypeAttributes: true, /*删除style和link的type=text/css*/
        minifyJS: true, //压缩页面JS
        minifyCSS: true //压缩页面CSS
    };
    return gulp.src(path.src.html + '/**/*.html')
        .pipe(fileinclude({ //文件嵌入
            prefix: '@@', //变量前缀 @@include
            basepath: path.src.includebase, //引用文件路径
            indent: true //保留文件的缩进
        }))
        .pipe(rev()) //引用文件添加版本号
        // .pipe(htmlmin(options))
        .pipe(gulp.dest(path.dist.html))
        .pipe(connect.reload());
});



//clean 清空dist目录中文件
gulp.task('clean', function() {
    return del(path.dist.baseroot + '/**/*');
});

// build任务，依赖清空任务
gulp.task('build', ['clean'], function() {
    gulp.start('html');
});

// 服务器监听
gulp.task('server', function() {
    connect.server({
        // host:'192.168.1.75',
        root: path.dist.html,
        port: 520,
        livereload: true
    })

    // 监控文件，有变动则执行对应方法
    gulp.watch(path.src.scss + '/*.scss', ['css']);
    // gulp.watch(path.src.css + './*.css', ['css']);
    gulp.watch(path.src.html + '/**/*.html', ['html']);
    gulp.watch(path.src.img + '/**/*', ['image']);
    gulp.watch(path.src.js + '/*.js', ['js']);
    // gulp.watch(path.src.font + '/*', ['font']);
});
