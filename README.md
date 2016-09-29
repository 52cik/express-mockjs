# express-mockjs

> express mockjs api server

[![Linux Build][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Dependencies][dependencies-image]][dependencies-url]
[![node][node-image]][node-url]
[![license MIT][license-image]][license-url]


## How to use it

### Installation

``` sh
$ npm install --save-dev express-mockjs
```

### Examples

``` js
var express = require('express')
var mockjs = require('express-mockjs')

var app = express()

// Using the default path /
app.use(mockjs('./mocks'))

// or custom path /api
app.use('/api', mockjs('./mocks'))

// Add your middleware here, etc.

app.listen(8000);
```

### Mock JSON

* [Mock.js 0.1 doc](https://github.com/nuysoft/Mock/wiki)  
* [Mock Sample](http://mockjs.com/examples.html)  


### Examples

```
.
├── mocks
    ├── home
    ⎪   ├── data.json
    ├── user
    ⎪   ├── data.json
    ├── game
        ├── data.json
```

## data.json 文件数据规范

`Mock JSON` here is not a real JSON file, and more like a JS file, so you want to use the following format.

> Hypothetical file in 'mocks/home/test.json'

``` js
/**
 * Interface function description
 *
 * @url /api-access-path
 *
 * Parameter description and other instructions。
 * uid: user ID
 * name: username
 * email: the email
 * etc.
 */

{
  "code": 0,
  "result|5": [
    {
      "uid|+1": 1,
      "name": "@name",
      "email": "@email"
    }
  ]
}
```

Then you can access the <http://localhost:3000/api/api-access-path> through the browser.



[travis-url]: https://travis-ci.org/52cik/express-mockjs
[travis-image]: https://img.shields.io/travis/52cik/express-mockjs/master.svg?label=linux

[coveralls-url]: https://coveralls.io/github/52cik/express-mockjs?branch=master
[coveralls-image]: https://coveralls.io/repos/52cik/express-mockjs/badge.svg?branch=master&service=github

[license-url]: https://opensource.org/licenses/MIT
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg

[dependencies-url]: https://david-dm.org/52cik/express-mockjs
[dependencies-image]: https://img.shields.io/david/52cik/express-mockjs.svg?style=flat

[node-url]: https://nodejs.org
[node-image]: https://img.shields.io/badge/node-%3E%3D%200.10.0-brightgreen.svg
