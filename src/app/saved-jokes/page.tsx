'use client';

import Link from "next/link";
import {useEffect, useState} from "react";
import {EJokeSave, Joke} from "@/utils/globals";
import {createJoke, getJokes, getJokesLikedState, removeJoke} from "@/utils/helpers";
import styles from "@/styles/site.module.css";
import {CiBookmarkMinus, CiBookmarkPlus} from "react-icons/ci";
import {RiArrowDropLeftLine} from "react-icons/ri";
import JokeCard from "@/app/components/JokeCard";

export default function Page( ) {
    const [ jokes, setJokes ] = useState< Joke[ ] >( [ ]);

    /**
     * Fetches saved jokes and displays them on site.
     *
     * @return { void }
     */
    const fetchSavedJokes = async ( ) : Promise< void > => {
        const joke_ids : string[ ] = getJokes( );
        let joke_array : Joke[ ] = [ ]

        let count = joke_ids.length; // > 10 ? 10 : joke_ids.length;
        // Todo: dynamically load all saved jokes
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
                    <JokeCard key={ joke.id } joke={ joke } hasLink={ true } onJokeUpdate={ ( ) => { // Joke gets passed to component, component sets joke likestate, no need to use the joke in the callback even though it is passed
                        setJokes( getJokesLikedState( jokes ).filter( ( joke : Joke ) => joke.isLiked ) );
                    } } /> ) }
            </div>
        </div>
    )
}