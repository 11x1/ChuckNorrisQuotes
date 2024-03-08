declare interface Joke {
    icon_url : string,
    id : string,
    url : string,
    value : string,
    isLiked : boolean
}

enum EJokeSave {
    FAILED = 0,
    SUCCESS = 1,
    EXISTS = 2
}

export type { Joke };
export { EJokeSave }