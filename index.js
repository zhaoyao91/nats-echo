#!/usr/bin/env node

const NATS = require('nats')
const args = require('node-args')
const colors = require('colors')

const {
  url = 'nats://localhost:4222',
  topic = '>',
  printHeadLine = true
} = args

function parseUrl (url) {
  const urls = url.split(',')
  if (urls.length === 1) return {url: urls[0]}
  else if (urls.length > 1) return {servers: urls}
}

let color

function logLines (...lines) {
  color = color === 'green' ? 'cyan' : 'green'
  lines.forEach(line => console.log(line[color]))
}

const options = {
  ...parseUrl(url),
  reconnect: true,
  waitOnFirstConnect: true,
  maxReconnectAttempts: -1,
  reconnectTimeWait: 1000,
}

const nats = NATS.connect(options)

// define default event handlers
nats.on('error', (err) => {
  console.error(err.red)
  process.exit(-1)
})

nats.on('connect', () => console.log('nats connected'))
nats.on('disconnect', () => console.log('nats disconnected'))
nats.on('reconnecting', () => console.log('nats reconnecting...'))
nats.on('reconnect', () => console.log('nats reconnected'))
nats.on('close', () => console.log('nats closed'))

nats.subscribe(topic, (message, reply, subject) => {
  if (printHeadLine) {
    logLines(
      `${(new Date).toISOString()} ${subject} ${reply || ''}`,
      message
    )
  }
  else {
    logLines(message)
  }
})

function parseJSONMessage (message) {
  try {
    return JSON.parse(message)
  }
  catch (err) {
    return message
  }
}