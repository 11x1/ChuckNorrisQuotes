'use client';

import {useEffect, useState} from "react";
import {IncomingMessage} from "node:http";
import https from "https";
import {EJokeSave, Joke} from "@/utils/globals";
import {createJoke, getBaseURI, getJokesLikedState, removeJoke, saveJoke} from "@/utils/helpers";
import Link from "next/link";

import styles from '@/styles/site.module.css';
import {RiQuillPenLine} from "react-icons/ri";
import {CiBookmark, CiBookmarkMinus, CiBookmarkPlus, CiLink, CiSearch} from "react-icons/ci";
import {AiOutlineLoading} from "react-icons/ai";

export default function Page( ) {
    const [ categories, setCategories ] = useState( [ 'random' ] );
    const [ jokes, setJokes ] = useState< Joke[ ] >( [ ] );
    const [ searchedCategory, setSearchedCategory ] = useState( 'random' );
    const [ isSearching, setIsSearching ] = useState( true );

    useEffect( ( ) => {
        https.get('https://api.chucknorris.io/jokes/categories', (res: IncomingMessage) => {

            res.on('data', (d: Uint8Array) => {
                setCategories(['random', ...JSON.parse(new TextDecoder().decode(d))]);
            })
        }).on('error', (_: Error) => {
            setCategories(['none']);
        });

        fetchJokes( 'random' ).then( ( ) => setIsSearching( false ) );
    }, [ ] );

    const fetchJokes = async ( category : string ) => {
        let uri = 'https://api.chucknorris.io/jokes/random';
        if ( category !== 'random' )
            uri = `https://api.chucknorris.io/jokes/random?category=${category}`;

        let generatedJokes : Joke[ ] = [ ];
        for ( let _ = 0; _ < 3; _++)
            await createJoke( uri ).then( ( joke : Joke ) => generatedJokes.push( joke ) );

        // What if we get same 2 jokes?
        // Since these are all different object, we can't check if they're the same with array filter/every
        let unique_ids : string[ ] = [ ];
        let repeating_ids : string[ ] = [ ];
        for ( let joke of generatedJokes ) {
            if ( !unique_ids.includes( joke.id ) )
                unique_ids.push( joke.id );
            else
                repeating_ids.push( joke.id );
        }

        // todo: there is still a small chance that there are duplicates in the 3 jokes generated after this has run
        // fix: while loop :)
        if ( unique_ids.length < generatedJokes.length )
            for ( let i   = 0; i < generatedJokes.length - 1; i++) {
                let joke : Joke = generatedJokes[ i ];

                let index = repeating_ids.indexOf( joke.id )
                if ( index === -1 )
                    continue;

                // Dealing with a duplicate element
                await createJoke( uri ).then( ( new_joke : Joke ) => {
                    generatedJokes[ i ] = new_joke;
                    repeating_ids[ index ] = '';

                    console.log( `Prevented duplicate ${ joke.id } -> ${ new_joke.id }` )
                })
            }

        generatedJokes = getJokesLikedState( generatedJokes );

        setJokes( generatedJokes );
    }

    const onJokeRequest = (  ) => {
        // @ts-ignore, target with id category exists, safely ignoring these errors
        if ( searchedCategory || !isSearching ) {
            setIsSearching( true );
            // @ts-ignore
            fetchJokes( searchedCategory ).then( ( ) => {
                console.log( 'Fetched new jokes.' );
                setIsSearching( false );
            } );
        }
        else if ( isSearching )
            console.log( 'Please wait for the last search to finish.' );
        else
            console.error( 'Error getting user specified category.' );
    }

    const onJokeClick = async ( joke : Joke ) => {
        let doAction : Function = joke.isLiked ? removeJoke : saveJoke;

        const joke_state_enum : EJokeSave = doAction( joke );

        let temp_jokes = jokes;

        switch ( joke_state_enum ) {
            case EJokeSave.FAILED:
                console.error( `Failed to ${ joke.isLiked ? 'remove' : 'save' } the joke` );
                break;
            case EJokeSave.EXISTS:
                console.error( `Failed to ${ joke.isLiked ? 'remove' : 'save' } the joke as it already exists in the opposite state.` );
                break;
            case EJokeSave.SUCCESS:
                console.log( `${ joke.isLiked ? 'Removed' : 'Saved' } joke ${ joke.isLiked ? 'from' : 'to' } favourites.` );
                temp_jokes = getJokesLikedState( jokes );
                setJokes( temp_jokes );
                break;
            default:
                console.log( `Unknown error occurred when trying to ${ joke.isLiked ? 'remove' : 'save' } the joke.` )
        }
    }

    const onJokeCopyLinkClick = ( joke : Joke ) => {
        navigator.clipboard.writeText( `${ getBaseURI( ) }/joke/${ joke.id }` );
    }

    const onDropDownClick = ( opt : HTMLElement ) => {
        let self = opt.parentElement?.parentElement;

        if ( self === null || self === undefined ) {
            console.log( 'Coulnd\'t get dropdown.' );
            return;
        }

        // If the classList has open then set the selected element
        if ( self.classList.contains( styles.headerDropdownOpen ) &&
             self.children[ 0 ] != null &&
             self.children[ 0 ].children[ 0 ] != null ) {
            // @ts-ignore
            self.children[ 0 ].children[ 0 ].innerText = opt.innerText;
            setSearchedCategory( opt.innerText );
        }

        self.style.setProperty( '--height', `${ opt.clientHeight * ( categories.length + 1 ) }px` )
        self.classList.toggle( styles.headerDropdownOpen );
    }

    return (
        <div className={ styles.container }>
            <div className={ styles.mobileTitle }>
                <RiQuillPenLine className={ styles.icon }/>
                <h1>Chuck Jokes</h1>
            </div>

            <div className={ styles.header }>
                <div className={ styles.desktopTitle }>
                    <RiQuillPenLine className={ styles.icon }/>
                    <h1>Chuck Jokes</h1>
                </div>

                <div className={ styles.headerComponentContainer }>
                    <div className={ styles.headerDropdownContainer }>
                        <div className={ styles.headerDropdown } onClick={
                            ( t ) =>
                                /* @ts-ignore */
                                onDropDownClick( t.target )
                        }>
                            <div className={ styles.dropdownOption }><p>random</p></div>
                            { categories.map( ( category : string ) => <div key={category} className={ styles.dropdownOption }><p>{category}</p></div> ) }
                        </div>
                    </div>

                    { isSearching ?
                        <div className={ styles.headerSmallButton }>
                            <AiOutlineLoading className={ styles.loadingIcon } />
                        </div>
                        :
                        <CiSearch onClick={ onJokeRequest } className={ styles.headerSmallButton } />
                    }
                    <Link href={ '/saved-jokes' }><CiBookmark className={ styles.headerSmallButton } /></Link>
                </div>
            </div>

            <div className={ styles.jokeList }>
                { jokes.map( ( joke : Joke ) =>
                    <div key={ joke.id }  className={ styles.jokeCard }>
                        <div className={ styles.jokeCardTextContainer }>
                            <p>{ joke.value }</p>
                        </div>

                        <CiLink className={ `${ styles.jokeCardLinkContainer } ${ styles.icon }` } onClick={ ( ) => onJokeCopyLinkClick( joke ) }/>

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
