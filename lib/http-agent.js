
var path = require('path'),
    events = require('events');

this.agent = function (host, urls, next) {
  this.host = host;
  this._unvisited = Array.prototype.slice.call(urls);
  this.next = next;

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
  _visited:   [],
  _unvisited: [],

  start: function() {
    this.emit('start', null, this);
    //this._next(Array.prototype.slice.call(this_unvisited, 1));
  },

  stop: function() {
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

  _next: function(url) {
    //
  },

  _delegate: function (method, property) {
      var self = this;
      this[method] = function () {
          return self[property][method].apply(self[property], arguments);
      };
  }
}
