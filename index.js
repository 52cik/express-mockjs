var fs = require('fs');
var path = require('path');

var Mock = require('mockjs-lite').Mock;
var walkdir = require('node-walkdir');

var template = fs.readFileSync(path.join(__dirname, 'doc.html'), 'utf8');
var RE = /^\s*\/\*[*\s]+?([^\r\n]+)[\s\S]+?@url\s+([^\n]+)[\s\S]+?\*\//im;


function mock(dir) {
  var routes = {}; // routes list

  walkdir(dir, /\.js(on)?$/i, function (filepath) {
    var content = String(fs.readFileSync(filepath, 'utf8')).trim() || '{}';

    var url = filepath;
    var describe = 'no description';

    var m = content.match(RE);

    if (m) {
      url = m[2].trim();
      describe = m[1].replace(/(^[\s*]+|[\s*]+$)/g, '');
    }

    if (url[0] !== '/') { // fix url path
      url = '/' + url;
    }

    var pathname = url;
    if (pathname.indexOf('?') > -1) {
      pathname = pathname.split('?')[0];
    }

    if (mock.debug && routes[pathname]) {
      console.warn('[Mock Warn]: [' + filepath + ': ' + pathname + '] already exists and has been covered with new data.');
    }

    routes[pathname] = {
      url: url,
      filepath: filepath,
      describe: describe,
    };

    if (/\.js$/.test(filepath)) {
      routes[pathname].data = require(filepath);
    } else {
      try {
        routes[pathname].data = new Function('return (' + content + ')')();
      } catch (e) {
        delete routes[pathname];
        mock.debug && console.warn('[Mock Warn]:', e);
      }
    }
  });


  return function (req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.set('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');

    if (req.method === 'OPTIONS') {
      return res.send('');
    }

    var url = req.url.split('?')[0];

    if (url === '/') { // api document page
      var host = req.protocol + '://' + req.headers.host + req.baseUrl;

      var list = Object.keys(routes).sort().map(function (path) {
        var route = routes[path];
        return {
          title: route.describe,
          url: host + route.url,
          file: route.filepath,
        };
      });

      return res.end(template.replace('@menuList', JSON.stringify(list)));
    }

    var data = (routes[url] || 0).data;

    if (data) {
      if (typeof data === 'function') {
        data = data(req);
      }
      res.json(Mock.mock(data));
    } else {
      next();
    }
  };
}

mock.debug = false;
module.exports = mock;
