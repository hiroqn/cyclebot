export type Request = {
    type: 'message-by-id'
    id: string
    text: string
} | {
    type: 'message-by-name'
    name: string
    text: string
}

export function requestMessageById(id:string, text: string): Request {
    return {
        type: 'message-by-id',
        id,
        text
    }
}

export function requestMessageByName(name:string, text: string): Request {
    return {
        type: 'message-by-name',
        name,
        text
    }
}
