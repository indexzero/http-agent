
//var httpAgent = exports;

//httpAgent.create = require('http-agent/core').create

this.agent = function () {};

this.create = function(next) {
	return new(this.agent);
}

this.agent.prototype = {
	
}