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
		"the create() method": {
			topic: function () {
				return httpAgent.create('foo.com', ['a', 'b', 'c']);
			},
			"should return a valid httpAgent": function(agent) {
				assert.instanceOf(agent, httpAgent.agent)
				assert.equal(agent.urls.length, 3);
				assert.equal(agent.urls[0], 'foo.com/a');
				assert.equal(agent.host, 'foo.com');
			}
		}
	}
}).export(module);