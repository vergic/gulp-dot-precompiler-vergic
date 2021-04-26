# gulp-dot-precompiler-vergic

Better [Gulp](https://github.com/gulpjs/gulp) plugin for precompilation of [doT](https://github.com/olado/doT) templates. Forked from [titarenko/gulp-dotify](https://github.com/titarenko/gulp-dotify) but with more control and much more logical.

Forked from [kentliau/gulp-dot-precompiler](https://github/kentliau/gulp-dot-precompiler) (which in it's turn was forked from [titarenko/gulp-dotify](https://github.com/titarenko/gulp-dotify), "with more control and much more logical").

## Status

[![Build Status](https://secure.travis-ci.org/kentliau/gulp-dot-precompiler.png?branch=master)](https://travis-ci.org/kentliau/gulp-dot-precompiler)
[![NPM version](https://badge.fury.io/js/gulp-dot-precompiler.png)](http://badge.fury.io/js/gulp-dot-precompiler)
[![Coverage Status](https://coveralls.io/repos/kentliau/gulp-dot-precompiler/badge.png)](https://coveralls.io/r/kentliau/gulp-dot-precompiler)
[![Dependecy Status](https://david-dm.org/kentliau/gulp-dot-precompiler.png)](https://david-dm.org/kentliau/gulp-dot-precompiler.png)


[![NPM](https://nodei.co/npm/gulp-dot-precompiler.png?downloads=true&stars=true)](https://nodei.co/npm/gulp-dot-precompiler/)

## Additions/changes from kentliau/gulp-dot-precompiler

* Updated dependencies
* Added possibility to use only filename as name (by setting separator to ''), i.e. no patch info
* Re-compile defs on every init by default.

## Options

* root :  prepend a name for the template name, default ''
* extension : append a name for the template name, default ''
* separator : separator for the name, default '.'
* dictionary : template function name, default 'render'
* templateSettings : [doT](https://github.com/olado/doT) template settings

##Include Partial View

```
< p > This is the main view < / p >

{{#def.loadfile('./sub_view.def') }}
```

This will include the `sub_view.def` from the same directory where the `loadfile()` is called. Not necessary to use `.def` as extension.


###Now with Error emitter

listen error in your gulp file

```

gulp.task('templates', function() {
    gulp.src( src_template )
    .pipe(plugins['dot-precompiler']({
                                       dictionary:'render',
                                       selfcontained:true,
                                       append:true
                                     })
      .on('error', plugins['notify']
        .onError({ title: "ERROR",
                   message: "Error: <%= error.message %>" })))

    // Build multiple compressed version
    .pipe(plugins['rename']({ extname: '.blade.php' }))
    .pipe(plugins['uglify']())
    .pipe(gulp.dest( build_template['server'] ))

    // Build a concatenated version in public
    .pipe(plugins['concat']('all.min.js'))
    .pipe(plugins['header']('window.render=window.render||{};'))
    .pipe(plugins['uglify']())
    .pipe(gulp.dest( build_template['client'] ))
    .pipe(plugins['notify']({ title: 'OK', message: 'Templates task complete' }));
});
```


## Example

If we have following folder structure:


```
app/views/users/list.dot
app/views/users/detail.dot
app/views/products/list.dot
app/views/products/detail.dot
app/views/layout.dot
```

Then, running this code:

```js
var dot = require('gulp-dot-precompiler'),
    concat = require('gulp-concat'), // npm install gulp-concat --save
    header = require('gulp-header'); // npm install gulp-header --save

gulp.task('templates', function() {
  gulp.src('app/views/**/*.dot')
  .pipe(dot())
  .pipe(concat('templates.js'))
  .pipe(header('window.render = {};'))
  .pipe(gulp.dest('public/js'));
});
```

Will produce `public/js/templates.js`:

```js
window.render = {};
render['users.list'] = function ...
render['users.detail'] = function ...
...
render['layout'] = function ...
```


##Todo

- [] rename all the options to be more self-descriptive
- [x] add dot delimiter options @caseyWebb
- [] allow loadfile() using object oriented way of parameter, just like laravel

## License

MIT
