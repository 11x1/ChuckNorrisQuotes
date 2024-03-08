import {Joke} from "@/utils/globals";
import {EJokeSave} from "@/utils/globals";
import https from "https";
import {IncomingMessage} from "node:http";
enum EJokeStorageTreatment {
    LocalStorage = 0
}

const TREATMENT = EJokeStorageTreatment.LocalStorage;

const isInLocalStorage = ( joke_id : string ) => {
    let data = localStorage.getItem( 'saved_jokes' );

    if ( data === null )
        return false;

    const decoded : string[ ] = JSON.parse( data )[ 0 ];

    return decoded.includes( joke_id );
}

const saveToLocalstorage = ( joke_id : string ) => {
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

const getLocalstorageJokes = ( ) : string[ ] => {
    let data = localStorage.getItem( 'saved_jokes' );

    if ( data === null )
        data = '{"0":[]}';

    return JSON.parse( data )[ 0 ];
}

const deleteFromLocalstorage = ( joke_id : string ) => {
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

function saveJoke( joke : Joke ) : EJokeSave {
    switch ( TREATMENT ) {
        case EJokeStorageTreatment.LocalStorage:
            return saveToLocalstorage( joke.id );
        default:
            return EJokeSave.FAILED;
    }
}

function getJokes( ) : string[ ] {
    switch ( TREATMENT ) {
        case EJokeStorageTreatment.LocalStorage:
            return getLocalstorageJokes( );
        default:
            return [ ]
    }
}

function removeJoke( joke : Joke ) : EJokeSave {
    switch ( TREATMENT ) {
        case EJokeStorageTreatment.LocalStorage:
            return deleteFromLocalstorage( joke.id );
        default:
            return EJokeSave.FAILED;
    }
}

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

const getJokesLikedState = (jokes : Joke[ ] ) => {
    return jokes.map( ( joke : Joke ) => {
        return {
            icon_url: joke.icon_url,
            id: joke.id,
            url: joke.url,
            value: joke.value,
            isLiked: isInLocalStorage(joke.id)
        }
    } );
}

const getBaseURI = ( ) => {
    return window === undefined ? process.env.NEXT_PUBLIC_DEVELOPMENT_SITE_URL : window.location.origin;
}

export { saveJoke, getJokes, createJoke, removeJoke, getJokesLikedState, getBaseURI }