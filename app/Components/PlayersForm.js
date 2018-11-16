import React from 'react';
import { Button } from 'react-bootstrap/lib';
import PropTypes from 'prop-types';

function PlayersForm({ players, updatePlayerName, addPlayer }) {
    return (
        <React.Fragment>
            <form onSubmit={e => e.preventDefault()}>
                {players.map((player, index) => (
                    <input
                        className="player-input"
                        value={player.name}
                        placeholder={`Player ${index + 1}`}
                        onChange={e => updatePlayerName(index, e.target.value)}
                        key={player.id}
                    />
                ))}
                <Button type="submit" onClick={addPlayer} disabled={players.length >= 5}>Add Player</Button>
            </form>
        </React.Fragment>
    );
}

PlayersForm.propTypes = {
    players: PropTypes.array.isRequired,
    updatePlayerName: PropTypes.func.isRequired,
    addPlayer: PropTypes.func.isRequired,
};

export default PlayersForm;
