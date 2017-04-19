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

## Handling of conflicts

> :information_source: Client needs to resolve conflicts

[Aggregate versions](https://github.com/ResourcefulHumans/rheactor-event-store#versioning) play an important part in the way state changes are implemented. The server will reject any update to an entity if the a wrong version number is [provided via the `If-Match` header](https://github.com/RHeactor/wiki/wiki/DeepDive#3-update-the-name). 

Clients therefore need get hold of the latest version number in the server's data store. Usually this is done by *reading* the entity. All entites are instances of `AggregateRoots` or `ImmutableAggregateRoots` from the [`rheactor-event-store`](https://github.com/ResourcefulHumans/rheactor-event-store) package and provide the version number (an Integer > 0).

If an update request provides the current server version, the request will be accepted and eventually the update event persisted.

This aproach offers these advantags:

1. Conflict handling is simple (form the servers perspective), either a change is applied fully or not, merging of changes is not supported.
2. It's up to the UI to decide *per use case* if after sending a change request it should reload the whole entity, or just increment its version number for *that specific entity*. So that consecutive updates can be send to the server without need to re-read data. This is especially handy in situations where concurrent editing of *the same entity* by *different users* is not possible.

That means for a client (and especially for UIs), that in 99% of user updates, everything will work fine, in the rare case of a conflict, it's far easier to ask the user to "reload the page" and have the user re-apply their changes, then merging changes from different updates.

Nevertheless, for RHeactor applications, having real-time updates in the UI is a central feature, which is implemented in [`rheactor-web-app`](https://github.com/ResourcefulHumans/rheactor-web-app#real-time-propagation-of-user-interactions).
