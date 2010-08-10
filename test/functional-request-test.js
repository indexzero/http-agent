/*
 * functional-request-test.js: Tests for functional requests (i.e. requests that generate 
 *                             their own ClientRequest) using HttpAgent
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENSE
 *
 */

var path = require('path'),
    sys = require('sys'),
    http = require('http'),
    events = require('events'),
    assert = require('assert'),
    eyes = require('eyes'),
		net = require('net'),
    vows = require('vows');

require.paths.unshift(path.join(__dirname, '..', 'lib'));

var httpAgent = require('http-agent');

vows.describe('httpAgent').addBatch({
  
}).export(module);