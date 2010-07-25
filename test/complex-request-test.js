/*
 * complex-request-test.js: Tests for complex requests using HttpAgent
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENSE
 *
 */

var path = require('path'),
    sys = require('sys'),
    http = require('http'),
    events = require('events'),
    assert = require('assert'),
    eyes = require('eyes'),
		net = require('net'),
    vows = require('vows');

require.paths.unshift(path.join(__dirname, '..', 'lib'));

var httpAgent = require('http-agent'),
    helpers = require('./helpers');

var complexUrls = [
  {
    method: 'GET',
    url: 'barackobama'
  },
  {
    method: 'GET',
    url: 'facebook'
  },
  {
    method: 'GET',
    url: 'google'
  }
];

vows.describe('httpAgent').addBatch({
  "When using an httpAgent": {
    "to browse an undefined url": {
      topic: function () {
        var agent = helpers.createAgent({ urls: [undefined] });
        agent.addListener('next', this.callback);
        agent.start();
      },
      "should throw an error": function (err, agent) {
        assert.isNotNull(err);
      }
    },
    "to browse a path of complex urls": {
      "the next event": {
        topic: function () {
          var agent = helpers.createAgent({ urls: complexUrls });
          agent.addListener('next', this.callback);
          agent.start();
        },
        "should be raised after start": function (e, agent) { 
          eyes.inspect(e);
          assert.instanceOf(agent, httpAgent.HttpAgent);
          assert.isNotNull(agent.response);
        }
      }
    }
  }
}).export(module);