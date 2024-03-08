'use client';

import Link from "next/link";
import {useEffect, useState} from "react";
import {EJokeSave, Joke} from "@/utils/globals";
import {createJoke, getJokesLikedState, removeJoke, saveJoke} from "@/utils/helpers";
import styles from "@/styles/site.module.css";
import {CiBookmarkMinus, CiBookmarkPlus} from "react-icons/ci";
import {RiArrowDropLeftLine} from "react-icons/ri";
import {AiOutlineLoading} from "react-icons/ai";

export default function Page( { params } : { params : { jokeid : string } } ) {
    const [ joke, setJoke ] = useState< Joke >( );

    const fetchSavedJokes = async ( ) => {
        await createJoke( `https://api.chucknorris.io/jokes/${ params.jokeid }` ).then( ( joke : Joke ) => {
            let joke_array = getJokesLikedState( [ joke ] );
            setJoke( joke_array[ 0 ] );
        } );
    }

    useEffect( ( ) => {
        fetchSavedJokes( ).catch( e => console.error( e ) )
    } );

    const onJokeClick = async ( joke : Joke ) => {
        let doAction : Function = joke.isLiked ? removeJoke : saveJoke;

        const joke_state_enum : EJokeSave = doAction( joke );

        switch ( joke_state_enum ) {
            case EJokeSave.FAILED:
                console.error( `Failed to ${ joke.isLiked ? 'remove' : 'save' } the joke` );
                break;
            case EJokeSave.EXISTS:
                console.error( `Failed to ${ joke.isLiked ? 'remove' : 'save' } the joke as it already exists in the opposite state.` );
                break;
            case EJokeSave.SUCCESS:
                console.log( `${ joke.isLiked ? 'Removed' : 'Saved' } joke ${ joke.isLiked ? 'from' : 'to' } favourites.` );
                setJoke( getJokesLikedState( [ joke ] )[ 0 ] );
                break;
            default:
                console.log( `Unknown error occurred when trying to ${ joke.isLiked ? 'remove' : 'save' } the joke.` )
        }
    }

    return (
        <div className={ styles.container }>
            <div className={ styles.header }>
                <Link href={ '/jokes' } className={ styles.button } >
                    <RiArrowDropLeftLine className={ styles.buttonIcon } />
                    <p>Back</p>
                </Link>
            </div>

            <div className={ styles.jokeList }>
                <div className={ styles.jokeCard }>
                    <div className={ `${ styles.jokeCardTextContainer } ${ styles.jokeCardTextContainerSingle }` }>
                        <p>{ joke === undefined ?
                            <AiOutlineLoading className={ styles.loadingIcon } />
                            :
                            joke.value
                        }</p>
                    </div>

                    { joke === undefined ?
                        <CiBookmarkPlus className={ `${ styles.jokeCardTextContainerSave } ${ styles.icon }` } />
                        :
                        joke.isLiked ?
                        <CiBookmarkMinus className={ `${ styles.jokeCardTextContainerSave } ${ styles.icon }` } onClick={ ( ) => onJokeClick( joke ) } />
                        :
                        <CiBookmarkPlus className={ `${ styles.jokeCardTextContainerSave } ${ styles.icon }` } onClick={ ( ) => onJokeClick( joke ) } />
                    }
                </div>
            </div>
        </div>
    )
}