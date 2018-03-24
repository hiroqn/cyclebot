export type Event
    = AccountsChanged
    | BotAdded
    | BotChanged
    | ChannelArchive
    | ChannelCreated
    | ChannelDeleted
    | ChannelHistoryChanged
    | ChannelJoined
    | ChannelLeft
    | ChannelMarked
    | ChannelRename
    | ChannelUnarchive
    | CommandsChanged
    | DndUpdated
    | DndUpdatedUser
    | EmailDomainChanged
    | EmojiChanged
    | FileChange
    | FileCommendDeleted
    | FileCommentAdded
    | FileCommentEdited
    | FileCreated
    | FileDeleted
    | FilePublic
    | FileShared
    | FileUnshared
    | Goodbye
    | GroupArchive
    | GroupClose
    | GroupHistoryChanged
    | GroupJoined
    | GroupLeft
    | GroupMarked
    | GroupOpen
    | GroupRename
    | GroupUnarchive
    | Hello
    | ImClose
    | ImCreated
    | ImHistoryChanged
    | ImMarked
    | ImOpen
    | ManualPresenceChange
    | MemberJoinedChannel
    | MemberLeftChannel
    | Message
    | PinAdded
    | PinRemoved
    | PrefChange
    | PresenceChange
    | PresenceSub
    | ReactionAdded
    | ReactionRemoved
    | ReconnectUrl
    | StarAdded
    | StarRemoved
    | SubteamCreated
    | SubteamMemberChanged
    | SubteamSelfAdded
    | SubteamSelfRemoved
    | SubteamUpdated
    | TeamDomainChange
    | TeamJoin
    | TeamMigrationStarted
    | TeamPlanChange
    | TeamPrefChange
    | TeamProfileChange
    | TeamProfileDelete
    | TeamProfileReorder
    | TeamRename
    | UserChange
    | UserTyping
    ;

export type AccountsChanged = {
    type: 'accounts_changed';
}

export type BotAdded = {
    type: 'bot_added';
    bot: {
        id: string;
        app_id: string;
        name: string;
        icons: {
            image_48: string;
        }
    }
}

export type BotChanged = {
    type: 'bot_changed';
    bot: {
        id: string;
        app_id: string;
        name: string;
        icons: {
            image_48: string;
        }
    }
}

export type ChannelArchive = {
    type: 'channel_archive';
    channel: string;
    user: string;
}

export type ChannelCreated = {
    type: 'channel_created';
    channel: {
        id: string;
        name: string;
        created: number;
        creator: string;
    }
}

export type ChannelDeleted = {
    type: 'channel_deleted';
    channel: string;
}

export type ChannelHistoryChanged = {
    type: 'channel_history_changed';
    latest: string;
    ts: string;
    event_ts: string;
}

export type ChannelJoined = {
    type: 'channel_joined';
    channel: any & object;
}

export type ChannelLeft = {
    type: 'channel_left';
    channel: string;
}

export type ChannelMarked = {
    type: 'channel_marked';
    channel: string;
    ts: string;
}

export type ChannelRename = {
    type: 'channel_rename';
    channel: {
        id: string
        name: string;
        created: number;
    };
}

export type ChannelUnarchive = {
    type: 'channel_unarchive';
    channel: string;
    user: string;
}

export type CommandsChanged = {
    type: 'commands_changed';
    event_ts : string;
}

export type DndUpdated = {
    type: 'dnd_updated';
    user: string;
    dnd_status: {
        dnd_enabled: boolean;
        next_dnd_start_ts: number;
        next_dnd_end_ts: number;
        snooze_enabled: boolean;
        snooze_endtime: number;
    }
}

export type DndUpdatedUser = {
    type: 'dnd_updated_user';
    user: string;
    dnd_status: {
        dnd_enabled: boolean;
        next_dnd_start_ts: number;
        next_dnd_end_ts: number;
    }
}

export type EmailDomainChanged = {
    type: 'email_domain_changed';
    email_domain: string;
    event_ts: string;
}

export type EmojiChanged_Add = {
    type: 'emoji_changed';
    subtype: 'add';
    name: string;
    value: string;
    event_ts: string;
}

export type EmojiChanged_Remove = {
    type: 'emoji_changed';
    subtype: 'remove';
    names: string[];
    event_ts: string;
}

export type EmojiChanged
    = EmojiChanged_Add
    | EmojiChanged_Remove
    ;

export type FileChange = {
    type: 'file_change';
    file_id: string;
    file: {
        id: string;
    };
}

export type FileCommentAdded = {
    type: 'file_comment_added';
    comment: any & object;
    file_id: string;
    file: {
        id: string;
    };
}

export type FileCommendDeleted = {
    type: 'file_comment_deleted';
    comment: string;
    file_id: string;
    file: {
        id: string;
    };
}

export type FileCommentEdited = {
    type: 'file_comment_edited';
    comment: any & object;
    file_id: string;
    file: {
        id: string;
    };
}

export type FileCreated = {
    type: 'file_created';
    file_id: string;
    file: {
        id: string;
    };
}

export type FileDeleted = {
    type: 'file_deleted';
    file_id: string;
    event_ts: string;
}

export type FilePublic = {
    type: 'file_public';
    file_id: string;
    file: {
        id: string;
    };
}

export type FileShared = {
    type: 'file_shared';
    file_id: string;
    file: {
        id: string;
    };
}

export type FileUnshared = {
    type: 'file_unshared';
    file_id: string;
    file: {
        id: string;
    };
}

export type Goodbye = {
    type: 'goodbye';
}

export type GroupArchive = {
    type: 'group_archive';
    channel: string;
}

export type GroupClose = {
    type: 'group_close';
    user: string;
    channel: string;
}

export type GroupHistoryChanged = {
    type: 'group_history_changed';
    latest: string;
    ts: string;
    event_ts: string;
}

export type GroupJoined = {
    type: 'group_joined';
    channel: any & object;
}

export type GroupLeft = {
    type: 'group_left';
    channel: string;
}

export type GroupMarked = {
    type: 'group_marked';
    channel: string;
    ts: string;
}

export type GroupOpen = {
    type: 'group_open';
    user: string;
    channel: string;
}

export type GroupRename = {
    type: 'group_rename';
    channel: {
        id: string;
        name: string;
        created: number;
    }
}

export type GroupUnarchive = {
    type: 'group_unarchive';
    channel: string;
}

export type Hello = {
    type: 'hello';
}

export type ImClose = {
    type: 'im_close';
    user: string;
    channel: string;
}

export type ImCreated = {
    type: 'im_created';
    user: string;
    channel: any & object;
}

export type ImHistoryChanged = {
    type: 'im_history_changed';
    latest: string;
    ts: string;
    event_ts: string;
}

export type ImMarked = {
    type: 'im_marked';
    channel: string;
    ts: string;
}

export type ImOpen = {
    type: 'im_open';
    user: string;
    channel: string;
}

export type ManualPresenceChange = {
    type: 'manual_presence_change';
    presence: 'active' | 'away';
}

export type MemberJoinedChannel = {
    type: 'member_joined_channel';
    user: string;
    channel: string;
    channel_type: 'C' | 'G';
    inviter?: string;
}

export type MemberLeftChannel = {
    type: 'member_left_channel';
    user: string;
    channel: string;
    channel_type: 'C' | 'G';
}

export type Message_BotMessage = {
    type: 'message';
    subtype: 'bot_message';
    ts: string;
    text: string;
    bot_id: string;
    username: string;
    icons: Partial<Record<string, string>>;
}

export type Message_ChannelArchive = {
    type: 'message';
    subtype: 'channel_archive';
    ts: string;
    text: string;
    user: string;
}

export type Message_ChannelJoin = {
    type: 'message';
    subtype: 'channel_join';
    ts: string;
    user: string;
    text: string;
    inviter?: string;
}

export type Message_ChannelLeave = {
    type: 'message';
    subtype: 'channel_leave';
    ts: string;
    user: string;
    text: string;
}

export type Message_ChannelName = {
    type: 'message';
    subtype: 'channel_name';
    ts: string;
    user: string;
    old_name: string;
    name: string;
    text: string;
}

export type Message_ChannelPurpose = {
    type: 'message';
    subtype: 'channel_purpose';
    ts: string;
    user: string;
    purpose: string;
    text: string;
}

export type Message_ChannelTopic = {
    type: 'message';
    subtype: 'channel_topic';
    ts: string;
    user: string;
    topic: string;
    text: string;
}

export type Message_ChannelUnarchive = {
    type: 'message';
    subtype: 'channel_unarchive';
    ts: string;
    text: string;
    user: string;
}

export type Message_FileComment = {
    type: 'message';
    subtype: 'file_comment';
    ts: string;
    text: string;
    file: any & object;
    comment: any & object;
}

export type Message_FileMention = {
    type: 'message';
    subtype: 'file_mention';
    ts: string;
    text: string;
    file: any & object;
    user: string;
}

export type Message_FileShare = {
    type: 'message';
    subtype: 'file_share';
    ts: string;
    text: string;
    file: any & object;
    user: string;
    upload: boolean;
}

export type Message_GroupArchive = {
    type: 'message';
    subtype: 'group_archive';
    ts: string;
    text: string;
    user: string;
    members: string[];
}

export type Message_GroupJoin = {
    type: 'message';
    subtype: 'group_join';
    ts: string;
    user: string;
    text: string;
}

export type Message_GroupLeave = {
    type: 'message';
    subtype: 'group_leave';
    ts: string;
    user: string;
    text: string;
}

export type Message_GroupName = {
    type: 'message';
    subtype: 'group_name';
    ts: string;
    user: string;
    old_name: string;
    name: string;
    text: string;
}

export type Message_GroupPurpose = {
    type: 'message';
    subtype: 'group_purpose';
    ts: string;
    user: string;
    purpose: string;
    text: string;
}

export type Message_GroupTopic = {
    type: 'message';
    subtype: 'group_topic';
    ts: string;
    user: string;
    topic: string;
    text: string;
}

export type Message_GroupUnarchive = {
    type: 'message';
    subtype: 'group_unarchive';
    ts: string;
    text: string;
    user: string;
}

export type Message_MeMessage = {
    type: 'message';
    subtype: 'me_message';
    channel: string;
    user: string;
    text: string;
    ts: string;
}

export type Message_MessageChanged = {
    type: 'message';
    subtype: 'message_changed';
    hidden: boolean;
    channel: string;
    ts: string;
    message: {
        type: 'message';
        user: string;
        text: string;
        ts: string;
        edited: {
            user: string;
            ts: string;
        };
    };
}

export type Message_MessageDeleted = {
    type: 'message';
    subtype: 'message_deleted';
    hidden: boolean;
    channel: string;
    ts: string;
    deleted_ts: string;
}

export type Message_MessageReplied = {
    type: 'message';
    message: {
        type: 'message';
        user: string;
        text: string;
        thread_ts: string;
        reply_count: number;
        replies: {
            user: string;
            ts: string;
        }[];
        ts: string;
    };
    subtype: 'message_replied';
    hidden: boolean;
    channel: string;
    event_ts: string;
    ts: string;
}

export type Message_PinnedItem = {
    type: 'message';
    subtype: 'pinned_item';
    user: string;
    item_type: 'F';
    text: string;
    item: any & object;
    channel: string;
    ts: string;
}

export type Message_ReplyBroadcast = {
    attachments: {
        author_icon: string;
        author_link: string;
        author_subname: string;
        channel_id?: string;
        channel_name?: string;
        fallback: string;
        footer?: string;
        id: number;
        mrkdwn_in: ('text')[];
        text: string;
        ts: string;
    }[];
    type: 'message';
    subtype: 'reply_broadcast';
    user: string;
    ts: string;
    channel: string;
    event_ts: string;
}

export type Message_UnpinnedItem = {
    type: 'message';
    subtype: 'unpinned_item';
    user: string;
    item_type: 'C' | 'F' | 'Fc' | 'G';
    text: string;
    item: any & object;
    channel: string;
    ts: string;
}

export type Message
    = {
      type: 'message';
      subtype: never;
      channel: string;
      user: string;
      text: string;
      ts: string;
      is_starred?: boolean;
      pinned_to?: string[];
      reactions?: {
          name: string;
          count: number;
          users: string[];
      }[];
      edited?: {
          user: string;
          ts: string;
      }
    }
    | Message_BotMessage
    | Message_ChannelArchive
    | Message_ChannelJoin
    | Message_ChannelLeave
    | Message_ChannelName
    | Message_ChannelPurpose
    | Message_ChannelTopic
    | Message_ChannelUnarchive
    | Message_FileComment
    | Message_FileMention
    | Message_FileShare
    | Message_GroupArchive
    | Message_GroupJoin
    | Message_GroupLeave
    | Message_GroupName
    | Message_GroupPurpose
    | Message_GroupTopic
    | Message_GroupUnarchive
    | Message_MeMessage
    | Message_MessageChanged
    | Message_MessageDeleted
    | Message_MessageReplied
    | Message_PinnedItem
    | Message_ReplyBroadcast
    | Message_UnpinnedItem
    ;

export type PinAdded = {
    type: 'pin_added';
    user: string;
    channel_id: string;
    item: any & object;
    event_ts: string;
}

export type PinRemoved = {
    type: 'pin_removed';
    user: string;
    channel_id: string;
    item: any & object;
    has_pins: boolean;
    event_ts: string;
}

export type PrefChange = {
    type: 'pref_change';
    name: string;
    value: string;
}

export type PresenceChange = {
    type: 'presence_change';
    user: string;
    users: never;
    presence: 'active' | 'away';
} | {
    type: 'presence_change';
    user: never;
    users: string[];
    presence: 'active' | 'away';
}

export type PresenceSub = {
    type: 'presence_sub';
    ids: string[];
}

export type ReactionAdded = {
    type: 'reaction_added';
    user: string;
    reaction: string;
    item_user: string;
    item: {
        type: 'message';
        channel: string;
        ts: string;
    } | {
        type: 'file';
        file: string;
    } | {
        type: 'file_comment';
        file_comment: string;
        file: string;
    };
    event_ts: string;
}

export type ReactionRemoved = {
    type: 'reaction_removed';
    user: string;
    reaction: string;
    item_user: string;
    item: {
        type: 'message';
        channel: string;
        ts: string;
    } | {
        type: 'file';
        file: string;
    } | {
        type: 'file_comment';
        file_comment: string;
        file: string;
    };
    event_ts: string;
}

export type ReconnectUrl = {
    type: 'reconnect_url';
}

export type StarAdded = {
    type: 'star_added';
    user: string;
    item: {
        type: 'message';
        channel: string;
        message: any & object;
    } | {
        type: 'file';
        file: any & object;
    } | {
        type: 'file_comment';
        file: any & object;
        comment: any & object;
    } | {
        type: 'channel';
        channel: string;
    } | {
        type: 'im';
        channel: string;
    } | {
        type: 'group';
        group: string;
    };
    event_ts: string;
}

export type StarRemoved = {
    type: 'star_removed';
    user: string;
    item: {
        type: 'message';
        channel: string;
        message: any & object;
    } | {
        type: 'file';
        file: any & object;
    } | {
        type: 'file_comment';
        file: any & object;
        comment: any & object;
    } | {
        type: 'channel';
        channel: string;
    } | {
        type: 'im';
        channel: string;
    } | {
        type: 'group';
        group: string;
    };
    event_ts: string;
}

export type SubteamCreated = {
    type: 'subteam_created';
    subteam: {
        id: string;
        team_id: string;
        is_usergroup: boolean;
        name: string;
        description: string;
        handle: string;
        is_external: boolean;
        date_create: number;
        date_update: number;
        date_delete: number;
        auto_type: null;
        created_by: string;
        updated_by: string;
        deleted_by: string | null;
        prefs: {
            channels: string[];
            groups: string[];
        };
        user_count: string;
    };
}

export type SubteamMemberChanged = {
    type: 'subteam_members_changed';
    subteam_id: string;
    team_id: string;
    date_previous_update: number;
    date_update: number;
    added_users: string[];
    added_users_count: string;
    removed_users: string[];
    removed_users_count: string;
}

export type SubteamSelfAdded = {
    type: 'subteam_self_added';
    subteam_id: string;
}

export type SubteamSelfRemoved = {
    type: 'subteam_self_removed';
    subteam_id: string;
}

export type SubteamUpdated = {
    type: 'subteam_updated';
    subteam: {
       id: string;
       team_id: string;
       is_usergroup: boolean;
       name: string;
       description: string;
       handle: string;
       is_external: boolean;
       date_create: number;
       date_update: number;
       date_delete: number;
       auto_type: 'admin';
       created_by: string;
       updated_by: string;
       deleted_by: string | null;
       prefs: {
           channels: string[];
           groups: string[];
       };
       users: string[];
       user_count: string;
    };
}

export type TeamDomainChange = {
    type: 'team_domain_change';
    url: string;
    domain: string;
}

export type TeamJoin = {
    type: 'team_join';
    user: any & object;
}

export type TeamMigrationStarted = {
    type: 'team_migration_started';
}

export type TeamPlanChange = {
    type: 'team_plan_change';
    plan: '' | 'std' | 'plus';
}

export type TeamPrefChange = {
    type: 'team_pref_change';
    name: string;
    value: any & object;
}


export type TeamProfileChange = {
    type: 'team_profile_change';
    profile: {
        fields: (any & object & { id: string })[];
    };
}

export type TeamProfileDelete = {
    type: 'team_profile_delete';
    profile: {
        fields: string[];
    };
}

export type TeamProfileReorder = {
    type: 'team_profile_reorder';
    profile: {
        fields: {
            id: string;
            ordering: number;
        }[];
    };
}

export type TeamRename = {
    type: 'team_rename';
    name: string;
}

export type UserChange = {
    type: 'user_change';
    user: any & object;
}

export type UserTyping = {
    type: 'user_typing';
    channel: string;
    user: string;
}
