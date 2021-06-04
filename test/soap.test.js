
var assert = require('assert')
var fs     = require('fs')

var Seneca = require('seneca')



describe('soap', function() {

  this.timeout(10*1000)


	/*
  before(function(done) {
    seneca.ready(done)
  })
	*/

	let seneca = null
	
	
  it('register', function(done) {
		seneca = Seneca().use('../soap.js')
		var callCount = 0
		seneca.add({role: 'soap-test', cmd: 'ping'}, function(args, callback) {
			callCount ++
			callback(undefined, {greeting: 'pong ' + args.name})
		})
		
    seneca.act({
      role: 'soap',
      cmd: 'register',
      name: 'TestModule',
      wsdl: fs.readFileSync(__dirname + '/soap.test.wsdl.xml').toString('utf8'),
      mappings: {
        ping: {
          role: 'soap-test',
          cmd: 'ping'
        }
      }
    }, function(err) {
      done(err)
    })

  })

  it('ping', function(done) {

    var soap = require('soap')
    var url = 'http://127.0.0.1:8004/TestModule?wsdl'
    var args = {name: Date.now() + ''}

    soap.createClient(url, function(err, client) {

      if(err) return done(err)

      client.ping(args, function(err, result) {
        if(err) return done(err)

        assert.ok(result)
        assert.equal(result.greeting, 'pong ' + args.name)

				seneca.close(done)
      })
    })

  })
})
