/* 
    Requires a valid spotify access token
    from ../Express/spotify-token-generator 
    to run correctly
*/

import { generateSpotifyAccessToken } from './api';
import { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [tracks, setTracks] = useState([]);
    const [playlistId, setPlaylistId] = useState('6EThH5r1x2ALtpQIaCaeKi');
    const [value, setValue] = useState('');
    const [accessToken, setAccessToken] = useState(null);

    const artists = ['Ava Max', 'Machine Gun Kelly'];

    useEffect(() => {
        const fetchData = async () => {
            const getAccessToken = async () => {
                const { access_token } = await generateSpotifyAccessToken();
                setAccessToken(access_token);
            };

            if (!accessToken) return await getAccessToken();
            fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                headers: {
                    Authorization: 'Bearer ' + accessToken,
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.error && data?.error?.status === 401) return setAccessToken(null);
                    const tracks = data.tracks.items;
                    setTracks(tracks);
                    console.log(tracks, accessToken);
                })
                .catch(async (err) => {
                    console.log(err);
                });
        };

        fetchData();
    }, [accessToken, playlistId]);

    const countArtist = (name) => {
        let count = 0;
        tracks.forEach((track) => {
            track.track.artists.forEach((artist) => {
                if (artist.name === name) count++;
            });
        });
        return count;
    };
    const artistRate = (am, mgk) => {
        return am / mgk;
    };

    const artistSongs = (name) => {
        const songs = [];
        tracks.forEach((track) => {
            track.track.artists.forEach((artist) => {
                if (artist.name === name) {
                    songs.push({ artists: track.track.artists, name: track.track.name });
                }
            });
        });
        return songs;
    };

    const handleInputChange = (e) => {
        setValue(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.keyCode === 13) {
            setPlaylistId(validateInput(value));
        }
    };

    const validateInput = (input) => {
        let playlistId;
        if (input.indexOf('http') > -1) {
            let splitted = input.split('/');
            const id = splitted[splitted.length - 1];
            // remove possible query params
            splitted = id.split('?').reverse();
            playlistId = splitted[splitted.length - 1];
        } else if (input.indexOf('spotify:playlist:') > -1) {
            const splitted = input.split(':');
            playlistId = splitted[splitted.length - 1];
        } else {
            playlistId = input;
        }

        return playlistId;
    };

    return (
        <div className="App">
            <h1>Ava Max x MGK Rate Calculator</h1>

            <input placeholder="Enter a spotify playlist URI, URL or ID" value={value} onKeyDown={handleKeyPress} onChange={handleInputChange} />
            <p>Ava Max contributions: {countArtist('Ava Max')}</p>
            <p>Machine Gun Kelly contributions: {countArtist('Machine Gun Kelly')}</p>
            <p>Quota/Rate: {artistRate(countArtist('Ava Max'), countArtist('Machine Gun Kelly'))}</p>
            {artists.map((artist, i) => (
                <div key={i}>
                    <h3>{artist}</h3>
                    {artistSongs(artist).length === 0 && <p>No songs found.</p>}
                    <ol>
                        {artistSongs(artist).map((song, i) => {
                            return (
                                <li key={i}>
                                    {song.name} by {new Intl.ListFormat('en').format(song.artists.map((artist) => artist?.name))}
                                </li>
                            );
                        })}
                    </ol>
                </div>
            ))}
        </div>
    );
}

export default App;
