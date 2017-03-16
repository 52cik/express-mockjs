var fs = require('fs');
var path = require('path');
var Mock = require('mockjs');
var walkdir = require('node-walkdir');

var RE = /^\s*\/\*[*\s]+?([^\r\n]+)[\s\S]+?@url\s+(\/[^\n]+)[\s\S]+?\*\//im;

function mock(dir) {
  var route = {}; // route list
  var docs = {}; // document list

  walkdir(dir, ['.js', '.json'], function (filename) {
    var content = String(fs.readFileSync(filename, 'utf8')).trim() || '{}';

    var url = filename;
    var doc = '[Mock Warn]: file "' + filename + '" no description!';

    var m = content.match(RE);

    if (m) {
      url = m[2].trim();
      doc = m[1].replace(/(^[\s*]+|[\s*]+$)/g, '');
    }

    if (mock.debug && route[url]) {
      console.warn('[Mock Warn]: [' + filename + ': ' + url + '] already exists and has been covered with new data.');
    }

    if (url[0] !== '/') { // fix url path
      url = '/' + url;
    }

    docs[url] = doc;

    try {
      var json = new Function('return (' + content + ')')();

      route[url] = json;
    } catch (e) {
      delete route[url];
      delete docs[url];
      mock.debug && console.warn('[Mock Warn]: ', e);
    }
  });

  return function (req, res) {
    var url = req.url.split('?')[0];

    if (route[url]) {
      res.json(Mock.mock(route[url]));
    } else {
      var host = '//' + req.headers.host + req.baseUrl;

      var html = ['<ol>'];
      Object.keys(docs).sort().forEach(function (key) {
        html.push('<li><a href=' + (host + key) + '>' + docs[key] + '</a></li>');
      });
      html.push('</ol>');

      res.type('html').end(html.join(''));
    }
  };
}

mock.debug = false;
module.exports = mock;
