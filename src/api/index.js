import config from '../config';

console.log(config);

let accessToken = null;
let expiresIn = 3600;
let generatedAt = null;

const CLIENT_TOKEN = config.CLIENT_TOKEN;
const CLIENT_SECRET = config.CLIENT_SECRET;

export async function generateSpotifyAccessToken() {
    if (!checkIfExpired(generatedAt, expiresIn)) return { access_token: accessToken };
    return await fetch('https://accounts.spotify.com/api/token?grant_type=client_credentials', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
            Authorization: 'Basic ' + new Buffer.from(CLIENT_TOKEN + ':' + CLIENT_SECRET).toString('base64'),
        },
    })
        .then((res) => res.json())
        .then((response) => {
            // use the access token to access the Spotify Web API
            accessToken = response.access_token;
            expiresIn = response.expires_in;
            generatedAt = new Date().getTime();
            console.log('Sent access token: ', accessToken);
            return { access_token: accessToken };
        })
        .catch((err) => {
            console.log('ERR', err);
            return { success: false };
        });
}

export async function getPlaylistById(playlistId) {
    if (!accessToken) return 'No access token set';

    return fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: {
            Authorization: 'Bearer ' + accessToken,
        },
    })
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            if (data?.error) {
                if (data.error.status === 404) {
                    console.log('ERROR 404');
                    return { success: false, error: data.error.message };
                }
                return { success: false, error: 'Some error!' };
            }
            const tracks = data.tracks.items;
            const playlistDetails = {
                name: data.name,
                description: data.description,
                owner: data.owner,
                followerCount: data.followers.total,
                images: data.images,
                link: data.href,
            };
            return { success: true, details: playlistDetails, tracks };
        })
        .catch(async (err) => {
            console.log(err);
        });
}

function checkIfExpired(generatedTime, expiresIn) {
    if (!generatedTime) return true;
    const expiresMs = expiresIn * 1000;
    return new Date().getTime() >= generatedTime + expiresMs;
}
