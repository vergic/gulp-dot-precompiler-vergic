var through = require('through2');
var dot = require('doT-vergic');
var _ = require('lodash');
var path = require('path');
var PluginError = require('plugin-error');
var fs = require('fs');
var defs = {};

var PLUGIN_NAME = 'gulp-dot-precompiler';

function getTemplateName(root, name, extension, separator) {
  if (separator === '') {
    return path.basename(name, path.extname(name));
  }

  var parts = name.split(path.sep);
  if (root.length !== 0) {
    parts.unshift(root);
  }
  if (extension.length !== 0) {
    parts[parts.length - 1] = parts[parts.length - 1] + extension;
  }
  return parts.join(separator);
}

function getTemplateCode(content, templateSettings, defs) {
  var compiled;
  try {
    compiled = dot.template(content, templateSettings, defs).toString();
  } catch (err) {
    console.log(err);
    return err;
  }

  return compiled;
}

function readStream(stream, done) {
  var buffer = '';
  stream.on('data', function (chunk) {
    buffer += chunk;
  }).on('end', function () {
    done(null, buffer);
  }).on('error', function (error) {
    done(error);
  });
}

function gulpDotify(options) {
  options = options || {};
  _.defaults(options, {
    root: '',
    separator: '.',
    extension: '',
    dictionary: 'render',
    cacheDefs: false,

    //doT.js setting
    templateSettings: {
      evaluate:    /\{\{([\s\S]+?(\}?)+)\}\}/g,
      interpolate: /\{\{=([\s\S]+?)\}\}/g,
      encode:      /\{\{!([\s\S]+?)\}\}/g,
      use:         /\{\{#([\s\S]+?)\}\}/g,
      useParams:   /(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g,
      define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
      defineParams:/^\s*([\w$]+):([\s\S]+)/,
      conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
      iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
      varname:     "it",
      strip:		true,
      append:		true,
      selfcontained: false,
      doNotSkipEncoded: false,
      globalEncodeHTMLFnName: false
    }
  });

  if (!options.cacheDefs) {
    // Clear defs on init (unless cacheDefs == true)
    // This will force re-compilation of defined subtemplates on each run (e.g. when this task is ran by a watcher)
    // Setting cacheDefs = true will mimic old behaviour, should we ever want that...
    defs = {};
  }

  var stream = through.obj(function (file, enc, callback) {
    var complete = function (error, contents) {
      if (error) {
        throw new PluginError(PLUGIN_NAME, error);
      }

      defs.loadfile = function (include_path) {
        current_path = (file.path).substr(0, (file.path).lastIndexOf(path.sep) + 1);
        return fs.readFileSync(current_path + include_path);
      };

      var relative_path = file.relative;
      var trimmed_ext = relative_path.substr(0, relative_path.lastIndexOf('.')) || relative_path;

      var name = getTemplateName(options.root, trimmed_ext, options.extension, options.separator);
      var code = getTemplateCode(contents, options.templateSettings, defs);
      if (typeof code !== 'string') {
        this.emit('error', new PluginError(PLUGIN_NAME, code));
      }
      file.contents = new Buffer([options.dictionary, '[\'', name, '\'] = ', code, ';'].join(''));

      this.push(file);
      return callback();
    }.bind(this);

    if (file.isBuffer()) {
      complete(null, file.contents.toString());
    } else if (file.isStream()) {
      readStream(file.contents, complete);
    }
  });
  return stream;
};

module.exports = gulpDotify;
