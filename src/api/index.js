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

function checkIfExpired(generatedTime, expiresIn) {
    if (!generatedTime) return true;
    const expiresMs = expiresIn * 1000;
    return new Date().getTime() >= generatedTime + expiresMs;
}
