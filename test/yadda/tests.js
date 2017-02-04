import path from 'path'
import glob from 'glob'
import app from '../server'
import runner from 'rheactor-yadda-feature-runner'
import {InternalContext, RestClientContext, TimeContext} from '@resourcefulhumans/rheactor-bdd-contexts'

app.redis.flushdb()

const apiFeaturesDir = path.normalize(path.join(__dirname, '/../../features'))

runner(app).run(glob.sync(apiFeaturesDir + '/*.feature'), [InternalContext, RestClientContext, TimeContext])
