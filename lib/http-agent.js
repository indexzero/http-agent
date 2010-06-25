
var path = require('path');

this.agent = function (host, urls, next) {
	this.host = host;
	this._queries = Array.prototype.slice.call(urls);
	this.next = next;
};

this.create = function(urls, next) {
	return new this.agent(urls, next);
}

this.agent.prototype = {
	get urls () {
		var self = this;
		return this._queries.map(function (query) {
			return path.join(self.host, query);
		});
	},
	
	set urls (values) {
		this._queries = Array.prototype.slice.call(values);
	}
}