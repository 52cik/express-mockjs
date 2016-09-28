var fs = require('fs');
var path = require('path');
var Mock = require('mockjs');
var walkdir = require('node-walkdir');

var RE_URL = /^\s*\/(?:\/\s*@url\s+(\/[^ \n]+)|\*[\s\S]+?@url\s+(\/[^\n]+)[\s\S]+?\*\/)/im;

module.exports = function (dir) {
  var route = {}; // route list

  walkdir(dir, '.json', function (filename) {
    var url = '/' + path.basename(filename, '.json');
    var content = fs.readFileSync(filename, 'utf8');

    var m = content.match(RE_URL);
    if (m) {
      url = m[1] || m[2] || url;
    }

    if (route[url]) {
      console.warn('[Mock]: URL already exists and has been covered with new data.');
    }

    try {
      var json = new Function('return (' + content + ')')();
      route[url] = json;
    } catch (e) {
      route[url] = {
        err: url + ' - Parse error!'
      }
    }
  });

  return function (req, res, next) {
    var url = req.url.split('?')[0];

    if (route[url]) {
      res.json(Mock.mock(route[url]));
    } else {
      next();
    }
  };

};
