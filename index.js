'use strict'

var AWS = require('aws-sdk')
// var debug = require('debug')('sqs')
var assert = require('assert')

/**
 * See .env.sample for the options.
 * Queue is the queue name.
 */
function clean (queue, options, done) {
  assert(options, 'missing options')
  assert(queue, 'missing queue')

  var sdk = new AWS.SQS(options)
  sdk.getQueueUrl({
    QueueName: queue
  }, function (err, result) {
    if (err) done(err)
    console.log('fetched queue url', result.QueueUrl)
    var params = {
      QueueUrl: result.QueueUrl
    }
    sdk.purgeQueue(params, function purge (err, data) {
      done(err, data)
    })
  })
}

module.exports = clean
