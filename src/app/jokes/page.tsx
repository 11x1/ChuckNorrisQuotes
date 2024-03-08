'use client';

import {useEffect, useState} from "react";
import {IncomingMessage} from "node:http";
import https from "https";
import {Joke} from "@/utils/globals";
import {createJoke, getJokesLikedState} from "@/utils/helpers";
import Link from "next/link";

import styles from '@/styles/site.module.css';
import {RiQuillPenLine} from "react-icons/ri";
import {CiBookmark, CiSearch} from "react-icons/ci";
import {AiOutlineLoading} from "react-icons/ai";
import JokeCard from "@/app/components/JokeCard";

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

    /**
     * Fetches jokes based on category and sets them.
     *
     * @param { string } category Joke array to get liked state of.
     * @return { void }.
     */
    const fetchJokes = async ( category : string ) : Promise< void > => {
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
        for ( let i = 0; i < generatedJokes.length - 1; i++) {
            let joke: Joke = generatedJokes[ i ];

            let index = repeating_ids.indexOf( joke.id )
            if ( index === -1 )
                continue;

            let joke_id: string = joke.id;

            while ( unique_ids.includes( joke_id ) ) {
                // Dealing with a duplicate element
                await createJoke(uri).then((new_joke: Joke) => {
                    generatedJokes[ i ] = new_joke;
                    repeating_ids[ index ] = '';
                    joke_id = new_joke.id;
                })
            }

            console.log(`Prevented duplicate ${ joke.id } -> ${ joke_id }`)
        }

        generatedJokes = getJokesLikedState( generatedJokes );

        setJokes( generatedJokes );
    }

    /**
     * Search button callback to return jokes base don category.
     *
     * @return { void }
     */
    const onJokeRequest = (  ) : void => {
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

    /**
     * Dropdown click callback.
     *
     * @param { HTMLElement } opt Clicked option.
     * @return { void }
     */
    const onDropDownClick = ( opt : HTMLElement ) : void => {
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
                    <JokeCard key={ joke.id } joke={ joke } hasLink={ true } onJokeUpdate={ ( ) => {
                        setJokes( getJokesLikedState( jokes ) );
                    } } /> ) }
            </div>
        </div>
    )
}
