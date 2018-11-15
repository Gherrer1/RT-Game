import React from 'react';

const HowToPlay = () => (
    <div>
        <h4>How good are you at guessing movie ratings?</h4>
        <ol>
            <li>Add up to 5 movies to start the game</li>
            <li>Each player guesses the rating for each movie</li>
            <li>Player with the lowest score at the end wins</li>
        </ol>

        <h4>How scoring works:</h4>
        <ul>
            <li>Each player starts at 0</li>
            <li>
                When player guesses a rating, the difference between <br /> his guess and the actual rating
                is added to his score. <br />
                    For example, if player guesses 75 for a movie rated 80, 5 is added to his score.
            </li>
            <li>
                If player guesses the score correctly, 10 is subtracted from player's score. 
            </li>
        </ul>
    </div>
);

export default HowToPlay;
