var path = require('path'),
    sys = require('sys'),
    http = require('http'),
    events = require('events'),
    assert = require('assert'),
    eyes = require('eyes'),
    vows = require('vows');

require.paths.unshift(path.join(__dirname, '..', 'lib'));

var httpAgent = require('http-agent');

vows.describe('httpAgent').addBatch({
  "When using an httpAgent": {
    topic: function () {
      return httpAgent.create('foo.com', ['a', 'e', 'c']);
    },
    "the create() method": {
      "should return a valid httpAgent": function(agent) {
        assert.instanceOf(agent, httpAgent.agent)
        assert.equal(agent.nextUrls.length, 3);
        assert.equal(agent.nextUrls[0], 'foo.com/a');
        assert.equal(agent.prevUrls.length, 0);
        assert.equal(agent.host, 'foo.com');
      },
      "should return a valid event emitter": function(agent) {
        assert.isFunction(agent.addListener);
        assert.isFunction(agent.removeListener);
        assert.isFunction(agent.removeAllListener);
        assert.isFunction(agent.listeners);
        assert.isFunction(agent.emit);
      }
    },
    "the start() method": {
      topic: function(agent) {
        agent.addListener('start', this.callback);
        agent.start();
      },
      "should emit the started event": function(e, agent) {
        assert.instanceOf(agent, httpAgent.agent);
      }
    },
    "the stop() method": {
      topic: function(agent) {
        agent.addListener('stop', this.callback);
        agent.stop();
      },
      "should emit the stopped event": function(e, agent) {
        assert.instanceOf(agent, httpAgent.agent);
      }
    }
  }
}).export(module);
