'use client';

import Link from "next/link";
import {useEffect, useState} from "react";
import {EJokeSave, Joke} from "@/utils/globals";
import {createJoke, getJokes, getJokesLikedState, removeJoke} from "@/utils/helpers";
import styles from "@/styles/site.module.css";
import {CiBookmarkMinus, CiBookmarkPlus} from "react-icons/ci";
import {RiArrowDropLeftLine} from "react-icons/ri";

export default function Page( ) {
    const [ jokes, setJokes ] = useState< Joke[ ] >( [ ]);

    const fetchSavedJokes = async ( ) => {
        const joke_ids : string[ ] = getJokes( );
        let joke_array : Joke[ ] = [ ]

        let count = joke_ids.length > 10 ? 10 : joke_ids.length;
        // Load first 10, afterward load them dynamically
        for ( let i = 0; i < count; i++ ) {
            await createJoke( `https://api.chucknorris.io/jokes/${ joke_ids[ i ] }` ).then( ( joke : Joke ) => {
                joke_array.push( joke );
            } );
        }

        joke_array = getJokesLikedState( joke_array );

        setJokes( joke_array );
    }

    useEffect( ( ) => {
        fetchSavedJokes( ).catch( e => console.error( e ) )
    }, [ ]  );

    const onJokeClick = ( joke : Joke ) => {

        const joke_state_enum : EJokeSave = removeJoke( joke );

        switch ( joke_state_enum ) {
            case EJokeSave.FAILED:
                console.error( `Failed to remove the joke` );
                break;
            case EJokeSave.EXISTS:
                console.error( `Failed to remove the joke as it already exists in the opposite state.` );
                break;
            case EJokeSave.SUCCESS:
                console.log( `Removed joke from favourites.` );
                setJokes( getJokesLikedState( jokes ).filter( ( joke : Joke ) => joke.isLiked ) );
                break;
            default:
                console.log( `Unknown error occurred when trying to remove the joke.` )
        }
    }

    return (
        <div className={ styles.container }>
            <div className={ styles.header }>
                <Link href={ '/jokes' } className={ styles.button } >
                    <RiArrowDropLeftLine className={ styles.buttonIcon } />
                    <p>Back</p>
                </Link>

                <h1>Saved Chuck&apos;s</h1>
            </div>

            <div className={ styles.jokeList }>
                { jokes.map( ( joke : Joke ) =>
                    <div key={ joke.id }  className={ styles.jokeCard }>
                        <div className={ styles.jokeCardTextContainer }>
                            <p>{ joke.value }</p>
                        </div>

                        { joke.isLiked ?
                            <CiBookmarkMinus className={ `${ styles.jokeCardTextContainerSave } ${ styles.icon }` } onClick={ ( ) => onJokeClick( joke ) } />
                            :
                            <CiBookmarkPlus className={ `${ styles.jokeCardTextContainerSave } ${ styles.icon }` } onClick={ ( ) => onJokeClick( joke ) } />
                        }
                    </div> ) }
            </div>
        </div>
    )
}