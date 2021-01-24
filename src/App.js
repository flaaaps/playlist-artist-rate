import { generateSpotifyAccessToken, getPlaylistById } from "./api";
import { useState, useEffect } from "react";
import "./App.css";
import { Button, Modal } from "semantic-ui-react";

function App() {
  const [tracks, setTracks] = useState([]);
  const [playlistDetails, setPlaylistDetails] = useState({});
  const [playlistId, setPlaylistId] = useState("6EThH5r1x2ALtpQIaCaeKi");
  const [playlistError, setPlaylistError] = useState();
  const [playlistValue, setPlaylistValue] = useState("");

  const [accessToken, setAccessToken] = useState(null);

  const [loading, setLoading] = useState(true);

  const artists = ["Ava Max", "Machine Gun Kelly"];

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const getAccessToken = async () => {
        const { access_token } = await generateSpotifyAccessToken();
        setAccessToken(access_token);
      };

      if (!accessToken) return await getAccessToken();
      const playlistResult = await getPlaylistById(playlistId);
      if (playlistResult.success) {
        setTracks(playlistResult.tracks);
        setPlaylistDetails(playlistResult.details);
        setPlaylistError(null);
      } else {
        const error = playlistResult.error;
        setPlaylistError(error);
      }
      setLoading(false);
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

  let timeout = null;
  const handleKeyPress = (e) => {
    e.preventDefault();
    console.log(playlistValue, "PLAYLIST VALUE");
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      setPlaylistId(validateInput(playlistValue));
    }, 650);
  };

  const validateInput = (input) => {
    console.log("Validating input...");
    console.log("Input: ", input);
    let playlistId;
    if (input === "" || input.length === 0) return null;
    if (input.indexOf("http") > -1) {
      const url = new URL(input);
      const pathname = url.pathname.split("/");
      playlistId = pathname[pathname.length - 1];
    } else if (input.indexOf("spotify:playlist:") > -1) {
      const split = input.split(":");
      playlistId = split[split.length - 1];
    } else {
      playlistId = input;
    }

    return playlistId;
  };

  // noinspection JSUnresolvedVariable
  return (
    <div className="App">
      <Modal size={"tiny"} open={!!playlistError}>
        <Modal.Content>
          <p>{playlistError}</p>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setPlaylistError(null)}>Ok</Button>
        </Modal.Actions>
      </Modal>

      <h1>Ava Max x MGK Rate Calculator</h1>
      <form onSubmit={handleKeyPress}>
        <input
          placeholder="Enter a spotify playlist URI, URL or ID"
          onKeyUp={(e) => setPlaylistValue(e.target.value)}
        />
        <button>Submit</button>
      </form>
      <span>{playlistError}</span>

      <div className="playlist-information">
        {loading ? (
          <img
            alt="Test"
            width="200"
            src="https://www.csuohio.edu/sites/default/files/1024px-Placeholder_no_text_svg.png"
          />
        ) : (
          <img
            src={playlistDetails.images[0].url}
            width="200"
            alt={playlistDetails.name}
            title={playlistDetails.name}
          />
        )}
        <h2>{playlistDetails.name}</h2>
        <p>{playlistDetails.description}</p>
      </div>
      <p>
        {artists[0]} contributions: {countArtist(artists[0])}
      </p>
      <p>
        {artists[1]} contributions: {countArtist(artists[1])}
      </p>
      <p>
        Quota/Rate:{" "}
        {artistRate(countArtist("Ava Max"), countArtist("Machine Gun Kelly"))}
      </p>
      {artists.map((artist, i) => (
        <div key={i}>
          <h3>{artist}</h3>
          {artistSongs(artist).length === 0 && <p>No songs found.</p>}
          <ol>
            {artistSongs(artist).map((song, i) => {
              return (
                <li key={i}>
                  {song.name} by{" "}
                  {new Intl.ListFormat("en").format(
                    song.artists.map((artist) => artist?.name)
                  )}
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
