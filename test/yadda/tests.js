'use strict'

let path = require('path')
let glob = require('glob')
let app = require('../server')
let runner = require('rheactor-yadda-feature-runner')(app)

app.redis.flushdb()

var apiFeaturesDir = path.normalize(path.join(__dirname, '/../../features'))
runner.run(glob.sync(apiFeaturesDir + '/*.feature'), glob.sync(apiFeaturesDir + '/context/*.js'))
