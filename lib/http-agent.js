/*
 * http-agent.js: A simple agent for performing a sequence of http requests in node.js 
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENSE
 *
 */
 
var http = require('http'),
    path = require('path'),
    sys = require('sys'),
    eyes = require('eyes'),
    events = require('events');

var httpAgent = exports;

httpAgent.HttpAgent = function () {
  var args = Array.prototype.slice.call(arguments);

  this.emitter = new(events.EventEmitter);

  this.host = args[0];
  this._visited = [];
  this._unvisited = [];
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

httpAgent.create = function (host, urls) {
  return new httpAgent.HttpAgent(host, urls);
};

httpAgent.HttpAgent.prototype = {
  url: '',
  body: '',
  encoding: "utf8",
  port: 80,
  _running: false,

  get prevUrls () {
    var self = this;
    return this._visited.map(function (url) {
      return path.join(self.host, url);
    });
  },

  get nextUrls () {
    var self = this;
    return this._unvisited.map(function (url) {
      return path.join(self.host, url);
    });
  },
  
  addUrl: function(url) {
    if (url) {
      this._unvisited = this._unvisited.concat(url);
    }
  },
  
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
  
  back: function () {
    if(this._running) {
      if(this._visited.length == 0) {
        this.emit('next', new(Error)("Cannot go back to nothing. Did you forget to call next()?"));
      }
      else {
        this.next(this._visited[0]);
      }
    }
  },
  
  next: function (url) {
    if(this._running) {
      // If the URL passed in exists, remove it 
      // from our _unvisited collection
      var index = this._unvisited.indexOf(url);
      if(index !== -1) {
        this._unvisited = this._unvisited.splice(index, 1);  
      }
      
      var shouldVisit = url || this._unvisited.length > 0;

      // TODO: Be more robust than just 'GET'
      if (shouldVisit) {
        this.url = url || this._unvisited.shift();
        this._makeRequest(this.url);
      }
      else {
        this.stop();
      }
    }
  },

  _makeRequest: function (url) {
    var client = http.createClient(80, this.host);
    this.body = '';
    
    // Try to create the request or dispatch the error
    try {
      var request = this._createRequest(client, url);
    }
    catch (e) {
      this.emit('next', e, self);
      this.emit('stop', e, self);
      return;
    }
    
    var self = this;
    request.addListener('response', function (response) {
      response.setEncoding(self.encoding);
      self.response = response;

      response.addListener("data", function (chunk) {
        self.body += chunk;
      });
      
      response.addListener("end", function (err, obj) {
        self._visited.unshift(url);
        self.emit('next', null, self);
      });
    });
    
    request.end();
  },
  
  _createRequest: function (client, url) {
    switch (typeof(url)) {
      case "string":    return client.request("GET", "/" + url, { "host": this.host });
      case "function":  return url.call(client);
      case "object":    return this._createComplexRequest(client, url);
      case "undefined": throw new(Error)("Cannot request undefined URL");
      default:          throw new(Error)("Argument Error"); 
    }
  },
  
  _createComplexRequest: function (client, options) {
    // Check if we're doing a POST or a PUT and have data to send
    var sendData = options.method.match(/^P/) && options.body && options.body.length > 0;
    
    options.headers = options.header || {};
    options.headers.Host = options.host || this.host;
    
    if(sendData) {
      options.headers['Content-Length'] = options.body.length;
    }

    var request = client.request(options.method, "/" + options.url, options.headers);
    if(sendData) {
      request.write(options.body, 'utf-8');
    } 
    
    return request;
  },

  _delegate: function (method, property) {
      var self = this;
      this[method] = function () {
          return self[property][method].apply(self[property], arguments);
      };
  },
  
  /*_extend: function (target, source) {
    var prop;
    Object.keys(source).forEach(function(prop) {
      target[prop] = source[prop];
    })
    return target;
  }*/
};
