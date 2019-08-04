const request = require('request')
const requestPromise = require('request-promise')
const fs = require('fs')
// TODO Use Mongo
// const mongodb = require('mongodb')
// const MongoClient = mongodb.MongoClient
// TODO 環境変数
const limit = 10
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
  slackPostOption.qs.text = `バズスレッドです。\n${messageLink}p${v.ts}`
  requestPromise(slackPostOption)
}

request(slackHistoryOption, (err, res, body) => {
  if (err) {
    console.error(err)
    return
  }
  const msg = body.messages.filter((o) => {
    return o.reply_count && limit <= o.reply_count
  })
  if (msg.length === 0) {
    console.log('Zero')
    return
  }
  msg.forEach((v, i) => {
    const r = readFile(v.ts)
    if (r) {
      if (Number(r) < Number(v.reply_count)) {
        postMessage(v)
        writeFile(v.ts, v.reply_count)

      }
    } else {
      postMessage(v)
      writeFile(v.ts, v.reply_count)
    }
  })
})
