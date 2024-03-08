import {Joke} from "@/utils/globals";
import {EJokeSave} from "@/utils/globals";
import https from "https";
import {IncomingMessage} from "node:http";
enum EJokeStorageTreatment {
    LocalStorage = 0
}

// In case someone wants to add their own data saving, i.e a database with a login system
// Then the treatment can be quickly changes
const TREATMENT = EJokeStorageTreatment.LocalStorage;

/**
 * Checks if a joke id is in local storage.
 *
 * @param { string } joke_id Joke id to find.
 * @return { boolean } Does joke exist in local storage.
 */
const isInLocalStorage = ( joke_id : string ) => {
    let data = localStorage.getItem( 'saved_jokes' );

    if ( data === null )
        return false;

    const decoded : string[ ] = JSON.parse( data )[ 0 ];

    return decoded.includes( joke_id );
}

/**
 * Saves a joke_id to local storage.
 *
 * @param { string } joke_id Joke id to save.
 * @return { EJokeSave } Joke save state.
 */
const saveToLocalstorage = ( joke_id : string ) : EJokeSave => {
    let data = localStorage.getItem( 'saved_jokes' );

    if ( data === null )
        data = '{"0":[]}';

    const decoded : string[ ] = JSON.parse( data )[ 0 ];

    if ( !decoded.includes( joke_id ) ) {
        decoded.push( joke_id );
        localStorage.setItem( 'saved_jokes', JSON.stringify({ 0 : decoded }) );
        return EJokeSave.SUCCESS;
    }

    return EJokeSave.EXISTS;
}

/**
 * Gets all joke id's in local storage.
 *
 * @return { string[ ] } Joke id array.
 */
const getLocalstorageJokes = ( ) : string[ ] => {
    let data = localStorage.getItem( 'saved_jokes' );

    if ( data === null )
        data = '{"0":[]}';

    return JSON.parse( data )[ 0 ].toReversed( );
}

/**
 * Deletes a joke from local storage.
 *
 * @param { string } joke_id Joke id to delete.
 * @return { EJokeSave } Joke delete state.
 */
const deleteFromLocalstorage = ( joke_id : string ) : EJokeSave => {
    let data = localStorage.getItem( 'saved_jokes' );

    if ( data === null )
        data = '{"0":[]}';

    const decoded : string[ ] = JSON.parse( data )[ 0 ];

    if ( decoded.includes( joke_id ) ) {
        const newJokeArray : string[ ] = [ ];
        for ( let i = 0; i < decoded.length; i++ ) {
            if ( decoded[ i ] !== joke_id )
                newJokeArray.push( decoded[ i ] );
        }
        localStorage.setItem( 'saved_jokes', JSON.stringify({ 0 : newJokeArray }) );
        return EJokeSave.SUCCESS;
    }

    return EJokeSave.FAILED;
}

/**
 * Saves a joke to local storage based on treatment type.
 *
 * @param { Joke } joke Joke to save.
 * @return { EJokeSave } Joke save state.
 */
function saveJoke( joke : Joke ) : EJokeSave {
    switch ( TREATMENT ) {
        case EJokeStorageTreatment.LocalStorage:
            return saveToLocalstorage( joke.id );
        default:
            return EJokeSave.FAILED;
    }
}

/**
 * Gets all jokes based on treatment type.
 *
 * @return { string[ ] } Saved joke ids.
 */
function getJokes( ) : string[ ] {
    switch ( TREATMENT ) {
        case EJokeStorageTreatment.LocalStorage:
            return getLocalstorageJokes( );
        default:
            return [ ]
    }
}

/**
 * Deletes a saved joke.
 *
 * @param { Joke } joke Joke to delete.
 * @return { EJokeSave } Joke delete state.
 */
function removeJoke( joke : Joke ) : EJokeSave {
    switch ( TREATMENT ) {
        case EJokeStorageTreatment.LocalStorage:
            return deleteFromLocalstorage( joke.id );
        default:
            return EJokeSave.FAILED;
    }
}

/**
 * Creates a joke based on chucknorris.io joke url.
 *
 * @param { string } url Api route url.
 * @return { Promise< Joke > } Joke response.
 */
const createJoke = ( url : string ) : Promise< Joke > => {
    return new Promise( ( resolve, reject )  => {
        https.get( url, ( res : IncomingMessage ) => {
            res.on( 'data', ( d : Uint8Array ) => {
                let joke : Joke = JSON.parse( new TextDecoder( ).decode( d ) );

                resolve( joke );
            } );

            res.on( 'error', ( e : Error ) => reject( e ) );
        } )
    });
}

/**
 * Checks if a joke is saved based on treatment type.
 *
 * @param { Joke } joke Joke to delete.
 * @return { boolean } Is joke saved.
 */
const isSaved = ( joke : Joke ) : boolean => {
    switch ( TREATMENT ) {
        case EJokeStorageTreatment.LocalStorage:
            return isInLocalStorage( joke.id );
        default:
            return false;
    }
}

/**
 * Gets joke liked state.
 *
 * @param { Joke[ ] } jokes Joke array to get liked state of.
 * @return { Joke[ ] } Joke array with updated saved states.
 */
const getJokesLikedState = ( jokes : Joke[ ] ) : Joke[ ] => {
    return jokes.map( ( joke : Joke ) => {
        return {
            icon_url: joke.icon_url,
            id: joke.id,
            url: joke.url,
            value: joke.value,
            isLiked: isSaved( joke )
        }
    } );
}

/**
 * Gets base url of the site.
 *
 * @return { string } Base uri.
 */
const getBaseURI = ( ) : string => {
    return window?.location?.origin === undefined ? "http://localhost:3000" : window.location.origin;
} 

export { saveJoke, getJokes, createJoke, removeJoke, getJokesLikedState, getBaseURI }