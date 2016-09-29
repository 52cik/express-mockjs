var fs = require('fs');
var path = require('path');
var Mock = require('mockjs');
var walkdir = require('node-walkdir');

var RE = /^\s*\/\*[*\s]+?([^\r\n]+)[\s\S]+?@url\s+(\/[^\n]+)[\s\S]+?\*\//im;

function mock(dir) {
  var route = {}; // route list
  var docs = {}; // document list

  walkdir(dir, '.json', function (filename) {
    var content = fs.readFileSync(filename, 'utf8');

    var url = '/' + path.basename(filename, '.json');
    var doc = '[file:' + filename + '] no description!';

    var m = content.match(RE);

    if (m) {
      url = m[2].trim();
      doc = m[1].replace(/(^[\s*]+|[\s*]+$)/g, '');
    }

    if (route[url] || docs[url]) {
      mock.debug && console.warn('[Mock Warn]: "' + filename + ': ' + url + '" already exists and has been covered with new data.');
    }

    docs[url] = doc;

    try {
      var json = new Function('return (' + content + ')')();

      route[url] = json;
    } catch (e) {
      var err = '"' + filename + ': ' + url + '" - Parse error!';

      route[url] = {
        err: err
      }

      mock.debug && console.warn('[Mock Warn]: ' + err);
    }
  });

  return function (req, res, next) {
    var url = req.url.split('?')[0];

    if (route[url]) {
      res.json(Mock.mock(route[url]));
    } else {
      var host = req.protocol + '://' + req.headers.host + req.baseUrl;
      var html = JSON.stringify(docs, function (k, v) {
        if (k[0] === '/') {
          return '<a href=' + (host + k) + '>' + v + '</a>';
        }
        return v;
      }, '  ');

      res.type('html');

      // Add b tags to prevent 'JSON Viewer' parsing.
      res.end('<b><pre>' + html);
    }
  };

}

mock.debug = true;
module.exports = mock;
