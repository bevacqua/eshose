'use strict'

const path = require('path')
const nconf = require('nconf')
const chalk = require('chalk')
const uuidv4 = require('uuid/v4')
const Twitter = require('twitter')
const { Client } = require('@elastic/elasticsearch')

nconf.env()
nconf.file('config', path.join(process.env.HOME, '.eshose'))

const twitterConsumerKey = nconf.get('TWITTER_CONSUMER_KEY')
const twitterConsumerSecret = nconf.get('TWITTER_CONSUMER_SECRET')
const twitterAccessTokenKey = nconf.get('TWITTER_ACCESS_TOKEN_KEY')
const twitterAccessTokenSecret = nconf.get('TWITTER_ACCESS_TOKEN_SECRET')
const host = nconf.get('ELASTICSEARCH_HOST')
const defaultTerms = nconf.get('TWITTER_SEARCH_TERMS')

const cliTerms = process.argv.slice(2).join(' ')
const terms = cliTerms || defaultTerms

if (typeof twitterConsumerKey !== `string`) {
  throw new Error(`Expected "TWITTER_CONSUMER_KEY" to be set.`)
}
if (typeof twitterConsumerSecret !== `string`) {
  throw new Error(`Expected "TWITTER_CONSUMER_SECRET" to be set`)
}
if (typeof twitterAccessTokenKey !== `string`) {
  throw new Error(`Expected "TWITTER_ACCESS_TOKEN_KEY" to be set`)
}
if (typeof twitterAccessTokenSecret !== `string`) {
  throw new Error(`Expected "TWITTER_ACCESS_TOKEN_SECRET" to be set`)
}
if (typeof host !== `string`) {
  throw new Error(`Expected "ELASTICSEARCH_HOST" to be set`)
}
if (typeof terms !== `string`) {
  throw new Error(`Expected "TWITTER_SEARCH_TERMS" to be set`)
}

const twitterClient = new Twitter({
  consumer_key: twitterConsumerKey,
  consumer_secret: twitterConsumerSecret,
  access_token_key: twitterAccessTokenKey,
  access_token_secret: twitterAccessTokenSecret
})

const elasticsearchClient = new Client({
  node: host
})

console.log(chalk.yellow(`Connecting to Twitter firehose for terms: "${ terms }"`))

twitterClient.stream('statuses/filter', { track: terms }, onStreamReady)

function onStreamReady(stream) {
  stream.on('data', function(tweet) {
    tweet.timestamp = new Date(tweet.created_at)
    tweet.hashtags = []
    tweet.users = []

    for (let i = 0; i < tweet.entities.hashtags.length; i++) {
      tweet.hashtags.push(tweet.entities.hashtags[i].text)
    }

    for (let j = 0; j < tweet.entities.user_mentions.length; j++) {
      tweet.users.push(tweet.entities.user_mentions[j].screen_name)
    }

    console.log(tweet.text)
    postToES(tweet)
  })

  stream.on('error', error => {
    console.error(chalk.red(error))
  })
}

function postToES(tweet) {
  const doc = {
    id: uuidv4(),
    index: 'tweets',
    type: 'tweets',
    body: tweet
  }

  elasticsearchClient.create(doc, inserted)
}

function inserted(error) {
  if (error) {
    console.warn(chalk.red(error.message))
  } else {
    console.log(chalk.green('[ok] Tweet inserted successfully'))
  }
}
