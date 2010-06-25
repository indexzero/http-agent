
var http = require('http')
    path = require('path'),
		sys = require('sys'),
    events = require('events');

this.agent = function () {
	var args = Array.prototype.slice.call(arguments);
	
	this.host = args[0];
  this._unvisited = Array.prototype.slice.call(args[1]);
	
	// TODO: Options or something like that for all the random 
	// HTTP settings that cannot be assumed default.

  this._delegate('addListener',       'emitter');
  this._delegate('removeListener',    'emitter');
  this._delegate('removeAllListener', 'emitter');
  this._delegate('listeners',         'emitter');
  this._delegate('emit',              'emitter');

  this.addListener('error', function (e) {
      // TODO: Logging
  });
};

this.create = function(urls, next) {
  return new this.agent(urls, next);
}

this.agent.prototype = {
  emitter:    new(events.EventEmitter),
  port: 80,
  _visited:   [],
  _unvisited: [],

  start: function () {
    this._next(this._unvisited.shift());
		this.emit('start', null, this);
  },

  stop: function () {
		var self = this;
    this.emit('stop', null, this);
  },

  get prevUrls () {
    var self = this;
    return this._visited.map(function (url) {
      return path.join(self.host, url);
    })
  },

  get nextUrls () {
    var self = this;
    return this._unvisited.map(function (url) {
      return path.join(self.host, url);
    });
  },

  _makeRequest: function (url, type) {
	  var client = http.createClient(this.port, this.host);
		var request = client.request(type, '/' + url, { 'host': this.host });
		request.end();
		request.addListener('response', this._processResponse);
	},
	
  _next: function (url) {
		// TODO: Be more robust than just 'GET'
    this._makeRequest(url, 'GET');
  },

  _processResponse: function(response) {
		sys.puts('processing response!');
	},

  _delegate: function (method, property) {
      var self = this;
      this[method] = function () {
          return self[property][method].apply(self[property], arguments);
      };
  }
}
