'use strict'

var test = require('tape')
var sqsClean = require('./')
var AWS = require('aws-sdk')
var async = require('async')
var sqsAwsSdk = require('sqs-aws-sdk')

require('dotenv').load()

var awsOptions = {}

if (process.env.AWS_ACCESS_KEY_ID) {
  awsOptions.accessKeyId = process.env.AWS_ACCESS_KEY_ID
  awsOptions.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  awsOptions.region = process.env.AWS_REGION
}

var sdk = new AWS.SQS(awsOptions)

test('purge queue', function (t) {
  async.waterfall([
    function clean (cb) {
      sqsClean(process.env.SQS_QUEUE, awsOptions, cb)
    },
    function testCount (result, cb) {
      countMessages(process.env.SQS_QUEUE, sdk, function (err, num) {
        t.equals(0, num)
        cb(err, num)
      })
    },
    function addMessage (result, cb) {
      sqsAwsSdk(sdk).push(process.env.SQS_QUEUE, {'test': 'test'}, function (err, data) {
        cb(err, data)
      })
    },
    function testCount (result, cb) {
      countMessages(process.env.SQS_QUEUE, sdk, function count (err, num) {
        t.equals(1, num)
        cb(err)
      })
    },
    function clean (cb) {
      // Yes, we have to wait 60 seconds :(
      setTimeout(function () {
        sqsClean(process.env.SQS_QUEUE, awsOptions, function (err) {
          cb(err)
        })
      }, 60000)
    },
    function testCount (cb) {
      countMessages(process.env.SQS_QUEUE, sdk, function count (err, num) {
        t.equals(0, num)
        cb(err, num)
      })
    }],
    function (err) {
      if (err) t.fail(err)
      t.end()
    }
  )
})

function countMessages (queue, sdk, cb) {
  sdk.getQueueUrl({
    QueueName: queue
  }, function (err, result) {
    if (err) cb(err)
    var params = {
      QueueUrl: result.QueueUrl,
      AttributeNames: ['ApproximateNumberOfMessages']
    }
    sdk.getQueueAttributes(params, function getAttributes (err, data) {
      console.log('DATA', data)
      if (err) cb(err) // an error occurred
      else cb(null, Number(data.Attributes.ApproximateNumberOfMessages))
    })
  })
}
