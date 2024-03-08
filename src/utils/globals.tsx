/**
 * Joke type to have consistent structure throught the project.
 */
declare interface Joke {
    icon_url : string,
    id : string,
    url : string,
    value : string,
    isLiked : boolean
}

/**
 * Joke save state enum to easily differentiate between joke saving state return values.
 */
enum EJokeSave {
    FAILED = 0,
    SUCCESS = 1,
    EXISTS = 2
}

export type { Joke };
export { EJokeSave }