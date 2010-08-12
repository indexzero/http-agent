# http-agent

A simple agent for performing a sequence of http requests in node.js

## PROJECT UNDER DEVELOPMENT

### Installation

<pre>
  npm install request
  cd /your/source/dir
  git clone http://github.com/indexzero/http-agent.git
</pre>

### Usage 
<pre>
  var sys = require('sys'),
      httpAgent = require('path/to/http-agent/lib');
  
  var agent = httpAgent.create('graph.facebook.com', ['barackobama', 'facebook', 'google']);
  
  agent.addListener('next', function (e, agent) {
    // Simple usage: Just output the raw
    // HTML returned from each request
    sys.puts(agent.body);
  });
  
  agent.addListener('stop', function (e, agent) {
    sys.puts('Agent has completed visiting all urls');
  });
  
  // Start the agent
  agent.start();
</pre>

### Run Tests
<pre>
  vows test/*-test.js --spec
</pre>

### TODO
Get http-agent on npm once it's stable and fully fleshed out.

#### Author: [Charlie Robbins](http://www.charlierobbins.com)