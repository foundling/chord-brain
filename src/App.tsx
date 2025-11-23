import { useState } from 'react'
import './App.scss'
import chordData from './chord-data.ts';

/* sub components */
function AppTitle({ onClick }) {
  return <div onClick={onClick} className="app-title-container">
    <h1>Chord Brain</h1>
  </div>
}

function CardFront({ chordName, onClick }) {
  return <div onClick = { onClick } className="card-front-container">
    { chordName }
  </div>
}

function CardBack({ notes, filterState, onClick }) {
  return <div onClick={onClick} className="card-back-container">
    <ul className="card-back-columns">
      {
          notes.reduce((memo, note, index) => {
            
            const intervalIsActive = filterState[Object.keys(filterState)[index]];
            const interval = Object.keys(filterState)[index]

            if (intervalIsActive) {
              return memo.concat([[note, interval]])
            }

            return memo;

          }, [])

            .map(([note, interval]) => (
              

              <li className="card-back-column">
                <div className="card-back-column-interval">{interval}</div>
                <div className="card-back-column-note">{note}</div>      
              </li>
            ))
        
      }   
    </ul>

  </div>
}

function NoteFilter({ filterState, onClick }) {
  return <ul className="interval-filter-options">
    {
      Object.entries(filterState).map(([interval, showInterval]) => {
        let className = "filter-option";
        if (!showInterval) {
          className += " inactive";
        }
        return <button
          onClick={(e) => onClick(e, interval) }
          className={className}>{ interval }
        </button>
      })
    }
  </ul>
}

/* data & related functions */
function getNextChord(data) {

  const chordNames = Object.keys(data);
  const index = Math.floor(Math.random() * 100) % chordNames.length;
  const name = chordNames[index];
  const notes = data[name];

  return {
    name: name,
    notes: notes
  }

}

const defaultFilterState = {
  '1': false,
  '3': true,
  '5': true,
  '7': true
}

function App() {

  const [ chord, setChord ] = useState(null);
  const [ appStarted, setAppStarted ] = useState(false);
  const [ facingUp, setFacingUp ] = useState(false);
  const [ filterState, setFilterState ] = useState(defaultFilterState)
  const [ previousChordNames, setPreviousChordNames ] = useState([]);

  function flipCard() {
    setFacingUp(!facingUp);
  }

  function restorePreviousChord() {
    const name = previousChordNames.pop()
    const notes = chordData[name];
    setChord({ name, notes });
  }

  function showNextChord() {

    // save chord to history.
    if (chord) {
      previousChordNames.push(chord.name);
    }

    setChord(getNextChord(chordData));
    setFacingUp(true);
  }

  function updateFilters(e, interval) {
    // if we have just one filter, and this would remove it, abort.
    if (filterState[interval] && Object.values(filterState).filter(Boolean).length <= 1) return;

    const updatedFilters = {
      ...filterState,
      [interval]: !filterState[interval]
    }
    setFilterState(updatedFilters);
  }

  function goBack() {

    // go to prev chord or flip card
    
    if (facingUp) {
      if (previousChordNames.length > 0) {
        // go to previous card's back side
        //setChord(previousChord)
        restorePreviousChord();
        flipCard();
      }
    } else {
        // just flip card.
      flipCard()
    }


  }

  function startApp() {
    setAppStarted(true);
    showNextChord();
  }

  if (!appStarted) {
    return <AppTitle onClick={ startApp } />
  }

  return (
    <div className="app-container">
      <header>
        <NoteFilter onClick={updateFilters} filterState={filterState} />
      </header>

      <div className="card-container">
      {
        facingUp ? 
          <CardFront onClick={ flipCard } chordName={ chord.name } /> :
          <CardBack onClick={ showNextChord } filterState={filterState} notes={ chord.notes } />
      }
      </div>

      <footer className="app-controls">
        <button
          title="go to previous chord or flip card"
          className="back-button"
          disabled={!(previousChordNames.length > 0 || !facingUp)}
          onClick={goBack}>⬅️</button>
      </footer>
    </div>
  )
}

export default App;