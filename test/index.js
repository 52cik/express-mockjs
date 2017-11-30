'use strict';

var path = require('path');
var express = require('express');
var request = require('supertest');
var mock = require('..');

console.warn = function () {};

describe('express mockjs test:', function () {

  describe('Basic testing.', function () {
    var app = express();
    app.use('/api', mock(path.join(__dirname, 'mocks')));

    it('page /', function (done) {
      request(app)
        .get('/api/home-data')
        .expect(200, /\/[\w-]+/, done);
    });

    it('page /home-data', function (done) {
      request(app)
        .get('/api/home-data')
        .expect('Content-Type', /json/)
        .expect(200, /^{"code":\d,"data":\{"list":\[\{"title"/, done);
    });

    it('page /home-links', function (done) {
      request(app)
        .get('/api/home-links')
        .expect('Content-Type', /json/)
        .expect(200, /^\{"code":[01],"list":\[\{"title":"[^"]+","link":"[^"]+"\}/, done);
    });

    it('page /user-list', function (done) {
      request(app)
        .get('/api/user-list')
        .expect('Content-Type', /json/)
        .expect(200, /^\{"code":\d,"data":\{"list":\[\{"id":\d,"name":/, done);
    });

    it('page /user', function (done) {
      request(app)
        .get('/api/user')
        .expect('Content-Type', /json/)
        .expect(200, { code: -1, msg: 'no uid' }, done);
    });

    it('page /user?uid=123', function (done) {
      request(app)
        .get('/api/user?uid=123')
        .expect('Content-Type', /json/)
        .expect(200, /^\{"code":0,"data":\{"uid":123,"name":/, done);
    });

    it('page /other-list', function (done) {
      request(app)
        .get('/api/other-list')
        .expect('Content-Type', /json/)
        .expect(200, /^\{"code":\d,"data":\{"list":\[\{"id":\d,"title":/, done);
    });

    it('page /other-info', function (done) {
      request(app)
        .get('/api/other-info')
        .expect('Content-Type', /json/)
        .expect(200, /^\{"code":\d,"data":\{"id":\d,"title":/, done);
    });

    it('page /the-api-not-fond', function (done) {
      request(app)
        .get('/api/the-api-not-fond')
        .expect(404, done);
    });

  });

  describe('Functional testing.', function () {

    it('defaults path / and post method', function (done) {
      var app = express();
      app.use(mock(path.join(__dirname, 'mocks')));
      mock.debug = true;

      setTimeout(function () {
        request(app)
          .post('/home-data')
          .expect('Content-Type', /json/)
          .expect(200, /^{"code":\d,"data":\{"list":\[\{"title"/, done);
      }, 9);
    });

    it('api document page', function (done) {
      var app = express();
      app.use('/test', mock(path.join(__dirname, 'mocks')));

      setTimeout(function () {
        request(app)
          .get('/test')
          .expect(200, /Express Mock Server/, done);
      }, 9);
    });
  });

  describe('OPTIONS', function () {
    it('OPTIONS', function (done) {
      var app = express();
      app.use('/test', mock(path.join(__dirname, 'mocks')));
      request(app)
        .options('/test')
        .expect(200, done);
    });

    it('Custom header', function (done) {
      var app = express();
      app.use('/test', mock(path.join(__dirname, 'mocks')));
      request(app)
        .options('/test')
        .set('Access-Control-Request-Headers', 'xCustom,haha')
        .expect('Access-Control-Allow-Headers', 'xCustom,haha')
        .expect(200, done);
    });
  });
});
