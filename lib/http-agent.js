
var http = require('http')
    path = require('path'),
    sys = require('sys'),
    eyes = require('eyes'),
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
  url: '',
  body: '',
  emitter:    new(events.EventEmitter),
  encoding: "utf8",
  port: 80,
  _running: false,
  _visited:   [],
  _unvisited: [],

  start: function () {
    if(!this._running) {
      this._running = true;
      this.emit('start', null, this);
      this.next();
    }
  },

  stop: function () {
    if(this._running) {
      this._running = false;
      this.emit('stop', null, this);
    }
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
  
  next: function (url) {
    if(this._running) {
      // If the URL passed in exists, remove it 
      // from our _unvisited collection
      var index = this._unvisited.indexOf(url)
      if(index !== -1) {
        this._unvisited = this._unvisited.splice(index, 1);  
      }
      
      var shouldVisit = url || this._unvisited.length > 0

      // TODO: Be more robust than just 'GET'
      if (shouldVisit) {
        this.url = url || this._unvisited.shift();
        this._makeRequest(this.url, 'GET');
      }
      else {
        this.stop();
      }
    }
  },

  _makeRequest: function (url, type) {
    var client = http.createClient(80, this.host);
    var request = client.request("GET", "/" + url, {"host": this.host});

    var self = this;
    request.addListener('response', function(response) {
      response.setEncoding(self.encoding);
      self.response = response;

      response.addListener("data", function (chunk) {
        self.body += chunk;
      });
      
      response.addListener("end", function(err, obj) {
        this._visited.unshift(url);
        self.emit('next', null, this);
      });
    });
    
    request.end();
  },

  _delegate: function (method, property) {
      var self = this;
      this[method] = function () {
          return self[property][method].apply(self[property], arguments);
      };
  }
}
