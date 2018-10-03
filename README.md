# cyclebot

🌀🤖

## How to run

```typescript
import { run } from '@cycle/rxjs-run';
import { Observable } from 'rxjs';

import {
    Environment,
    Event,
    makeSlackBotDriver,
    Request,
    requestMessageById,
    SlackBotSource,
} from 'cyclebot';

type SoMain = { SlackBot: SlackBotSource };
type SiMain = { SlackBot: Observable<Request> };

function main({ SlackBot }: SoMain): SiMain {
    const { event: event$, environment: environment$ } = SlackBot;

    const request$ = event$.withLatestFrom(environment$)
        .mergeMap<[Event, Environment], Request>(([event, environment]) => {
            switch (event.type) {
                case 'message':
                    if (!event.subtype) {
                        const user = environment.users[event.user];
                        if (user && !user.is_bot) {
                            const request = requestMessageById(event.channel, event.text);
                            return Observable.of(request);
                        }
                    }

                default:
                    return Observable.empty();
            }
        });

    return {
        SlackBot: request$,
    };
}

run<SoMain, SiMain>(main, {
    SlackBot: makeSlackBotDriver(process.env.SLACK_API_TOKEN || '', {}),
});
```
