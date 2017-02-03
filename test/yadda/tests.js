import path from 'path'
import glob from 'glob'
import app from '../server'
import runner from 'rheactor-yadda-feature-runner'
import {InternalContext} from './bdd-contexts/internals'
import {RestClientContext} from './bdd-contexts/rest-client'
import {TimeContext} from './bdd-contexts/time'

app.redis.flushdb()

const apiFeaturesDir = path.normalize(path.join(__dirname, '/../../features'))

runner(app).run(glob.sync(apiFeaturesDir + '/*.feature'), [InternalContext, RestClientContext, TimeContext])
