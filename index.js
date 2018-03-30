#!/usr/bin/env node

const NATS = require('nats')
const args = require('node-args')

// parse input args

const {
  url = 'nats://localhost:4222',
  topic = '>',
  mode = 'user'
} = args

// build control options

let options

if (mode === 'user') {
  options = {
    logLines: 2,
    reconnectOnStart: true,
    colorful: true,
  }
}
else if (mode === 'system') {
  options = {
    logLines: 1,
    reconnectOnStart: false,
    colorful: false
  }
}
else {
  throw new Error(`invalid mode: ${mode}`)
}

function boot () {
  if (options.colorful) require('colors')

  const natsOptions = {
    ...parseUrl(url),
    reconnect: true,
    waitOnFirstConnect: options.reconnectOnStart,
    maxReconnectAttempts: -1,
    reconnectTimeWait: 1000,
  }

  const nats = NATS.connect(natsOptions)

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

  const logLines = options.colorful ? logLinesWithColor : logLinesWithoutColor
  const logMessage = options.logLines === 1 ? logMessageInOneLine : logMessageInTwoLines

  nats.subscribe(topic, (message, reply, subject) => {
    logMessage(logLines, message, reply, subject)
  })

  process.on('SIGTERM', () => {
    console.log('SIGTERM received, goodbye.')
    process.exit(1)
  })

  process.on('SIGINT', () => {
    console.log('SIGINT received, goodbye.')
    process.exit(1)
  })
}

function parseUrl (url) {
  const urls = url.split(',')
  if (urls.length === 1) return {url: urls[0]}
  else if (urls.length > 1) return {servers: urls}
}

let color

function logLinesWithColor (...lines) {
  color = color === 'green' ? 'cyan' : 'green'
  lines.forEach(line => console.log(line[color]))
}

function logLinesWithoutColor (...lines) {
  lines.forEach(line => console.log(line))
}

function logMessageInOneLine (logLines, message, reply, subject) {
  logLines(JSON.stringify({
    topic: subject,
    replyTopic: reply,
    message: parseJSONMessage(message)
  }))
}

function logMessageInTwoLines (logLines, message, reply, subject) {
  logLines(
    `${(new Date).toISOString()} ${subject} ${reply || ''}`,
    message
  )
}

function parseJSONMessage (message) {
  try {
    return JSON.parse(message)
  }
  catch (err) {
    return message
  }
}

boot()