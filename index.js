var fs = require('fs');
var path = require('path');
var Mock = require('mockjs');
var walkdir = require('node-walkdir');

var RE_URL = /^\s*\/(?:\/\s*@url\s+(\/[^ \n]+)|\*[\s\S]+?@url\s+(\/[^\n]+)[\s\S]+?\*\/)/im;
var RE_DOC = /^\s*\/\*[*\s]+?([^\r\n]+)[\s\S]+?@url\s+(\/[^\n]+)/;

module.exports = function (dir) {
  var route = {}; // route list
  var docs = {}; // document list

  walkdir(dir, '.json', function (filename) {
    var url = '/' + path.basename(filename, '.json');
    var content = fs.readFileSync(filename, 'utf8');

    url = getUrl(content, url);

    if (route[url] || docs[url]) {
      console.warn('[Mock]: URL already exists and has been covered with new data.');
    }

    docs[url] = getDoc(content, filename);

    try {
      var json = new Function('return (' + content + ')')();
      route[url] = json;
    } catch (e) {
      route[url] = {
        err: url + ' - Parse error!'
      }
    }
  });

  function getUrl(content, url) {
    var m = content.match(RE_URL);

    if (m) {
      url = (m[1] || m[2] || url).trim();
    }

    return url;
  }

  function getDoc(content, filename) {
    var m = content.match(RE_DOC);

    if (m) {
      return m[1].replace(/(^[\s*]+|[\s*]+$)/g, '');
    }

    return '[file:' + filename + '] no description!';
  }

  return function (req, res, next) {
    var url = req.url.split('?')[0];

    if (route[url]) {
      res.json(Mock.mock(route[url]));
    } else {
      // next();
      var host = req.protocol + '://' + req.headers.host + req.baseUrl;
      var html = JSON.stringify(docs, function (k, v) {
        if (k[0] === '/') {
          return '<a href=' + (host + k) + '>' + v + '</a>';
        }
        return v;
      }, '  ');
      
      res.type('html');
      // Add b tags to prevent JSON Viewer parsing
      res.end('<b><pre>' + html);
    }
  };

};
