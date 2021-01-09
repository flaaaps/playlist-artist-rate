/* 
    Requires a valid spotify access token
    from ../Express/spotify-token-generator 
    to run correctly
*/

import { useState, useEffect } from 'react';

function App() {
    const [tracks, setTracks] = useState([]);
    const [accessToken, setAccessToken] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const getAccessToken = async () => {
                const { access_token } = await (await fetch('http://localhost:1237')).json();
                setAccessToken(access_token);
            };
            console.log(!accessToken);
            if (!accessToken) return await getAccessToken();
            fetch('https://api.spotify.com/v1/playlists/5yACIst2lkJRtgMLBOqcJK', {
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
    }, [accessToken]);

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
    return (
        <div className="App">
            <h1>Ava Max x MGK Rate Calculator</h1>
            <p>Ava Max contributions: {countArtist('Ava Max')}</p>
            <p>Machine Gun Kelly contributions: {countArtist('Machine Gun Kelly')}</p>
            <p>Quota/Rate: {artistRate(countArtist('Ava Max'), countArtist('Machine Gun Kelly'))}</p>
            <div>
                <h3>Ava Max</h3>
                <ol>
                    {artistSongs('Ava Max').map((song, i) => {
                        return (
                            <li key={i}>
                                {song.name} by {new Intl.ListFormat('en').format(song.artists.map((artist) => artist?.name))}
                            </li>
                        );
                    })}
                </ol>
            </div>
            <div>
                <h3>MGK</h3>
                <ol>
                    {artistSongs('Machine Gun Kelly').map((song, i) => {
                        return (
                            <li key={i}>
                                {song.name} by {new Intl.ListFormat('en').format(song.artists.map((artist) => artist?.name))}
                            </li>
                        );
                    })}
                </ol>
            </div>
        </div>
    );
}

export default App;
