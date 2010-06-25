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
				return httpAgent.create();
			},
			"should return a valid httpAgent": function(agent) {
				assert.instanceOf(agent, httpAgent.agent)
			}
		}
	}
}).export(module);