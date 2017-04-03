# rheactor-server

[![Build Status](https://travis-ci.org/ResourcefulHumans/rheactor-server.svg?branch=master)](https://travis-ci.org/ResourcefulHumans/rheactor-server)
[![npm version](https://img.shields.io/npm/v/rheactor-server.svg)](https://www.npmjs.com/package/rheactor-server)
[![monitored by greenkeeper.io](https://img.shields.io/badge/greenkeeper.io-monitored-brightgreen.svg)](http://greenkeeper.io/) 
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![semantic-release](https://img.shields.io/badge/semver-semantic%20release-e10079.svg)](https://github.com/semantic-release/semantic-release)[![Test Coverage](https://codeclimate.com/github/ResourcefulHumans/rheactor-server/badges/coverage.svg)](https://codeclimate.com/github/ResourcefulHumans/rheactor-server/coverage)
[![Code Climate](https://codeclimate.com/github/ResourcefulHumans/rheactor-server/badges/gpa.svg)](https://codeclimate.com/github/ResourcefulHumans/rheactor-server)

Core server components for [RHeactor applications](https://github.com/RHeactor).

The server provides typical business capabilities of a web application:

 - User registration flow
 - Login (Sessions are implemented stateless with [JSONWebTokens](https://jwt.io)  
 - Managing of user details like email address, name, avatar, preferences
 - SuperUser role
 
 All features are available via a RESTful, [JSON-LD](http://json-ld.org/) inspired API and via a command line interface. API errors will always be represented as a [`HttpProblem`](https://github.com/ResourcefulHumans/rheactor-models/blob/master/src/http-problem.js).
 
 See the [BDD tests](https://github.com/ResourcefulHumans/rheactor-server/tree/master/features) for a complete description of the API features.
 
 The available CLI commands are defined in [`src/console-command/`](https://github.com/ResourcefulHumans/rheactor-server/tree/master/src/console-command),
