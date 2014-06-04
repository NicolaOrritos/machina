
'use strict';


var agents = require('../lib/agents');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.machina = {
    setUp: function(done)
    {
        // setup here
        done();
    },
    
    'Agents': function(test)
    {
        test.expect(7);
        
        test.ok(agents);
        
        agents.load();
        test.deepEqual(agents.list().length, 0);
        
        var agent1 = 'agent1';
        agents.sub(agent1);
        test.deepEqual(agents.list().length, 1);
        
        agents.unsub(agent1);
        test.deepEqual(agents.list().length, 0);
        
        agents.sub(agent1);
        agents.sub(agent1);
        test.deepEqual(agents.list().length, 1);
        
        agents.unsub(agent1);
        test.deepEqual(agents.list().length, 0);
        
        var action1 = 'action1';
        agents.sub(agent1, action1);
        test.deepEqual(agents.actions(agent1).length, 1);
        
        
        test.done();
    }
};
