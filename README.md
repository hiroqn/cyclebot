# cyclebot
🌀🤖
##How to run

```js

const {run} = require('@cycle/rxjs-run');
const {makeSlackBotDriver, reply} = require('cyclebot');

run(({Bot}) => {
  return {
    Bot: Bot.selectByName('#bot').map(message => reply(message, message.text))
  }
}, {
  Bot: makeSlackBotDriver(`${process.env.SLACK_TOKEN}`, {})
});

```
