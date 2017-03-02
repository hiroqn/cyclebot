# cyclebot
🌀🤖
##How to run

```js

const {run} = require('@cycle/rxjs-run');
const {makeSlackBotDriver, requestMessageById} = require('cyclebot');

run(({Bot}) => {
    return {
        Bot: Bot.selectByChannelName('bot').map(message => 
             requestMessageById(message.channel_id, message.text))
    }
}, {
  Bot: makeSlackBotDriver(`${process.env.SLACK_TOKEN}`, {})
});

```
