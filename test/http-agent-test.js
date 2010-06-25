var path = require('path'),
    sys = require('sys'),
    http = require('http'),
    events = require('events'),
    assert = require('assert'),
    eyes = require('eyes'),
    vows = require('vows');

require.paths.unshift(path.join(__dirname, '..', 'lib'));

var httpAgent = require('http-agent');

function createAgent (options) {
	options = options || {};
	var host = options.host || 'graph.facebook.com';
	var urls = options.urls || ['barackobama', 'facebook', 'google'];
	var events = options.events || [];
	
	return httpAgent.create(host, urls);
}

var someAgent = createAgent();
someAgent.start();

vows.describe('httpAgent').addBatch({
  "When using an httpAgent": {
    "the create() method": {
			topic: createAgent(),
      "should return a valid httpAgent": function(agent) {
        assert.instanceOf(agent, httpAgent.agent)
        assert.equal(agent.nextUrls.length, 3);
        assert.equal(agent.nextUrls[0], 'graph.facebook.com/barackobama');
        assert.equal(agent.prevUrls.length, 0);
        assert.equal(agent.host, 'graph.facebook.com');
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
      topic: function () {
				var agent = createAgent();
				agent.addListener('start', this.callback);
				agent.start();
			},
      "should emit the started event": function(e, agent) {
        assert.instanceOf(agent, httpAgent.agent);
				assert.equal(agent.nextUrls.length, 2);
				assert.equal(agent.nextUrls[0], 'graph.facebook.com/facebook')
      }
    },
    "the stop() method": {
      topic: function () {
				var agent = createAgent();
				agent.addListener('stop', this.callback);
				agent.stop();
			},
      "should emit the stopped event": function(e, agent) {
        assert.instanceOf(agent, httpAgent.agent);
      }
    }
  }
}).export(module);
