/*
 * http-agent.js: A simple agent for performing a sequence of http requests in node.js 
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENSE
 *
 */
 
var events = require('events'),
    http = require('http'),
    path = require('path'),
    url = require('url'),
    util = require('util'),
    request = require('request');

exports.create = function (host, urls) {
  return new HttpAgent(host, urls);
};

var HttpAgent = exports.HttpAgent = function (host, urls) {
  events.EventEmitter.call(this);
    
  //
  // TODO: Options or something like that for all the random
  // HTTP settings that cannot be assumed default.
  //

  this.url = '';
  this.body = '';
  this.encoding = 'utf8',
  this.port = 80;
  this._running = false;

  this.host = host;
  this._visited = [];
  this._unvisited = [];
  this._unvisited = urls;

  this.addListener('error', function (e) {
    //
    // Suppress `uncaughtException` errors from 
    // this instance.
    //
  });
};

//
// Inherit from `events.EventEmitter`.
//
util.inherits(HttpAgent, events.EventEmitter);

HttpAgent.prototype.__defineGetter__('prevUrls', function () {
  var self = this;
  return this._visited.map(function (url) {
    return path.join(self.host, url);
  });
});

HttpAgent.prototype.__defineGetter__('nextUrls', function () {
  var self = this;
  return this._unvisited.map(function (url) {
    return path.join(self.host, url);
  });
});
  
HttpAgent.prototype.addUrl = function(url) {
  if (url) {
    this._unvisited = this._unvisited.concat(url);
  }
};
  
HttpAgent.prototype.start = function () {
  if (!this._running) {
    this._running = true;
    this.emit('start', null, this);
    this.next();
  }
};

HttpAgent.prototype.stop = function () {
  if (this._running) {
    this._running = false;
    this.emit('stop', null, this);
  }
};
  
HttpAgent.prototype.back = function () {
  if (this._running) {
    return this._visited.length == 0
      ? this.emit('next', new Error('Cannot go back to nothing. Did you forget to call next()?'))
      : this.next(this._visited[0]);
  }
};
  
HttpAgent.prototype.next = function (url) {
  if (this._running) {
    // If the URL passed in exists, remove it 
    // from our _unvisited collection
    var index = this._unvisited.indexOf(url);
    if (index !== -1) {
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
};

HttpAgent.prototype._makeRequest = function (url) {
  this.body = '';
  
  // Try to create the request or dispatch the error
  try {
    var options = this._createOptions(url);
  }
  catch (createErr) {
    this.emit('next', createErr);
    this.emit('stop', createErr);
    return;
  }
  
  var self = this;
  
  try {
    request(options, function (err, response, body) {
      if (err) {
        return self.emit('next', err);
      }
      
      self.current = options;
      self._visited.unshift(url);
      self.response = response;
      self.body = body;
      self.emit('next', null, self);
    });
  }
  catch (requestErr) {
    this.emit('next', requestErr);
  }
};
  
HttpAgent.prototype._createOptions = function (url) {
  switch (typeof(url)) {
    case 'string':    return { uri: 'http://' + this.host + '/' + url };
    case 'function':  return url.call(this);
    case 'object':    return this._createComplexOptions(url);
    case 'undefined': throw new Error('Cannot request undefined URL');
    default:          throw new Error('Argument Error'); 
  }
};
  
HttpAgent.prototype._createComplexOptions = function (options) {
  if (typeof options.uri === 'undefined') {
    throw new Error('uri is required on object based urls.');
  }
  
  var parsedUri = url.parse(options.uri),
      protocol  = parsedUri.protocol || 'http:',
      host      = parsedUri.host || this.host,
      pathname  = parsedUri.pathname.charAt(0) === '/' ? parsedUri.pathname : '/' + parsedUri.pathname;
  
  options.uri = protocol + '//' + host + pathname;
  
  if (typeof parsedUri.query !== 'undefined' && parsedUri.query.length > 0) {
    options.uri = options.uri + '?' + parsedUri.query;
  }
  
  return options;
};
