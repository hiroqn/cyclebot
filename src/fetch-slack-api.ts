import {request} from 'https';
import * as querystring from 'querystring';

import {ClientRequest, IncomingMessage} from 'http';
import {Observable, Subscriber} from 'rxjs';

export function fetchSlackApi<T>(method: string, params: any, parser: (r: any) => T | null): Observable<T> {
    return new Observable<T>((observer: Subscriber<T>): Function => {

        let responseBody = '';

        const req: ClientRequest = request({
            protocol: 'https:',
            hostname: 'slack.com',
            port: 443,
            path: `/api/${method}?${querystring.stringify(params)}`,
            method: 'GET',
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            }
        }, (response: IncomingMessage): void => {

            switch (response.statusCode) {
                case 200:
                    response.setEncoding('utf8');
                    response.on('data', (chunk: string): void => {
                        responseBody += chunk
                    });
                    response.on('end', (): void => {
                        try {
                            const json = JSON.parse(responseBody);

                            const status = parser(json);
                            if (status) {
                                observer.next(status);
                                observer.complete();
                            } else {
                                observer.error(new Error('CannotParse'));
                            }
                        } catch (e) {
                            observer.error(new Error('CannotParse'));
                        }
                    });
                    response.on('error', (error: Error): void => observer.error(error));
                    return;
                case 429:
                    observer.error(new Error(`TooManyRequests:${response.headers['retry-after']}`));
                    return;
                default:
                    observer.error(new Error('NotSuccess'));
                    return;
            }
        });
        req.end();
        return () => req.abort();
    });
}
