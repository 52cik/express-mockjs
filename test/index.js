'use strict';

var express = require('express');
var request = require('supertest');
var mock = require('..');

console.warn = function () {};

describe('express mockjs test:', function () {

  describe('Basic testing.', function () {
    var app = express();
    app.use('/api', mock('./test/mocks'));

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
        .expect(200, /^\{"list":\[\{"title":"[^"]+","link":"[^"]+"\}/, done);
    });

    it('page /user-list', function (done) {
      request(app)
        .get('/api/user-list')
        .expect('Content-Type', /json/)
        .expect(200, /^\{"code":\d,"data":\{"list":\[\{"id":\d,"name":/, done);
    });

    it('page /user-1', function (done) {
      request(app)
        .get('/api/user-1')
        .expect('Content-Type', /json/)
        .expect(200, /^\{"code":\d,"data":\{"id":\d,"name":/, done);
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

  });

  describe('Functional testing.', function () {

    it('defaults path / and post method', function (done) {
      var app = express();
      app.use(mock('./test/mocks'));

      setTimeout(function () {
        request(app)
          .post('/home-data')
          .expect('Content-Type', /json/)
          .expect(200, /^{"code":\d,"data":\{"list":\[\{"title"/, done);
      }, 9);
    });

    it('Interface does not exist then returns a API list', function (done) {
      mock.debug = false;

      var app = express();
      app.use('/test', mock('./test/mocks'));

      setTimeout(function () {
        request(app)
          .get('/test/123')
          .expect('Content-Type', /html/)
          .expect(200, /\/[\w-]+/, done);
      }, 9);
    });

  });

});
