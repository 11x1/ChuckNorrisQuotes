import styles from "@/styles/site.module.css";
import {AiOutlineLoading} from "react-icons/ai";
import {CiBookmarkMinus, CiBookmarkPlus, CiLink} from "react-icons/ci";
import {EJokeSave, Joke} from "@/utils/globals";
import {getBaseURI, removeJoke, saveJoke} from "@/utils/helpers";

interface JokeCardProps {
    joke : Joke | string | undefined,
    hasLink : boolean,
    onJokeUpdate : Function;
}

export default function JokeCard( { joke, hasLink, onJokeUpdate } : JokeCardProps ) {
    const setJokeLikeState = ( joke : Joke, new_state : boolean ) => {
        joke.isLiked = new_state;
        onJokeUpdate( joke );
    }

    /**
     * Sets joke liked/bookmarked state.
     *
     * @param { Joke } joke The joke element thats' bookmark icon was clicked.
     * @return { void }
     */
    const onJokeClick = ( joke : Joke ) : void => {
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
                setJokeLikeState( joke, !joke.isLiked  );
                break;
            default:
                console.log( `Unknown error occurred when trying to ${ joke.isLiked ? 'remove' : 'save' } the joke.` )
        }
    }

    /**
     * Copies joke url.
     *
     * @param { Joke } joke The joke element thats' copy icon was clicked.
     * @return { void }
     */
    const onJokeCopyLinkClick = ( joke : Joke ) : void => {
        navigator.clipboard.writeText( `${ getBaseURI( ) }/joke/${ joke.id }` ).catch( e => { console.error( e ) /* Proper logging would be useful here */; throw e; } );
    }

    return ( <div className={ styles.jokeCard }>
        <div className={ `${ styles.jokeCardTextContainer } ${ !hasLink ? styles.jokeCardTextContainerSingle : '' }` }>
            <p>{typeof joke === "string" || joke === undefined ?
                <AiOutlineLoading className={ styles.loadingIcon } />
                :
                joke.value
            }
            </p>
        </div>


        { hasLink ?
            <CiLink className={ `${ styles.jokeCardLinkContainer } ${ styles.icon }` } onClick={ ( ) => typeof joke === "string" || joke === undefined ? null : onJokeCopyLinkClick( joke ) }/>
            : null
        }
        { typeof joke === "string" || joke === undefined ?
            <CiBookmarkPlus className={ `${ styles.jokeCardTextContainerSave } ${ styles.icon }` } />
            : joke.isLiked ?
                <CiBookmarkMinus className={ `${ styles.jokeCardTextContainerSave } ${ styles.icon }` } onClick={ ( ) => onJokeClick( joke ) } />
                :
                <CiBookmarkPlus className={ `${ styles.jokeCardTextContainerSave } ${ styles.icon }` } onClick={ ( ) => onJokeClick( joke ) } />
        }
    </div> )
}