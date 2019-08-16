const request = require('request')
const requestPromise = require('request-promise')
const fs = require('fs')
// TODO Use Mongo
// const mongodb = require('mongodb')
// const MongoClient = mongodb.MongoClient
// TODO 環境変数
const limit = 10
const limitMultiple = 5
const slackHost = 'https://xxxx.slack.com/'
const tolken = 'xxxx'
const slackHistoryId = 'xxxx'
const slackPostId = 'xxxxx'
const messageLink = `${slackHost}archives/${slackHistoryId}/`

const slackHistoryOption = {
  url: 'https://slack.com/api/groups.history',
  method: 'GET',
  qs: {
    token: tolken,
    channel: slackHistoryId
  },
  json: true
}

let slackPostOption = {
  url: 'https://slack.com/api/chat.postMessage',
  method: 'POST',
  qs: {
    token: tolken,
    channel: slackPostId,
    text: '',
    username: 'BuzzBot'
  },
  json: true
}

const readFile = (name) => {
  try {
    return fs.readFileSync(`${__dirname}/json/${name}`, 'utf-8')
  } catch(e) {
    return null
  }
}

const writeFile = (name, text) => {
  fs.writeFileSync(`${__dirname}/json/${name}`, text, 'utf-8')
}

const postMessage = (v) => {
  slackPostOption.qs.text = `This thread is BUZZ. (${v.reply_count} replies)\n\`\`\`${v.text}\`\`\`\n${messageLink}p${v.ts}`
  requestPromise(slackPostOption)
}

const getCountLogic = (n) => {
  return Math.floor(n / limitMultiple)
}

request(slackHistoryOption, (err, res, body) => {
  if (err) {
    console.error(err)
    return
  }
  body.messages
    .filter((o) => {
      const c = readFile(o.ts)
      return c
        ? (o.reply_count && getCountLogic(c) < getCountLogic(o.reply_count))
        : (o.reply_count && limit <= o.reply_count)
    })
    .forEach((v, i) => {
      postMessage(v)
      writeFile(v.ts, v.reply_count)
    })
})