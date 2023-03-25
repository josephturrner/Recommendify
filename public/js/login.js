// import querystring from 'query-string';

var redirect_uri = 'http://localhost:8888/callback/';

var clientID = 'de1edab117b649a58d1e84d1ef7ce560'; // Your client id
var clientSecret = '6232df2c5d28412b93837c891ac88214'; // Your secret

const AUTHORIZE = "https://accounts.spotify.com/authorize";

const TOKEN = "https://accounts.spotify.com/api/token";
// const ARTISTS = "https://api.spotify.com/v1/me/top/artists?offset=0&limit=10&time_range=short_term"
const ARTISTS = "https://api.spotify.com/v1/me/top/artists"
const TRACKS = "https://api.spotify.com/v1/me/top/tracks"

const rankingList = document.getElementById('ranking-list');
const favSongList = document.getElementById('favorite-song-list');
const favArtistList = document.getElementById('favorite-artist-list');
const start = document.getElementById('start');
const number = document.getElementById('nosong');
const time = document.getElementById('timerange');


function buildRequest(baseURL) {
    let url = baseURL;
    url += '?';
    url += `offset=${start.value}`
    url += `&limit=${number.value}`
    url += `&time_range=${time.value}`
    return url;
}

function authorize() {
    let url = AUTHORIZE;
    url += "?client_id=" + clientID;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-read-playback-state user-top-read";
    window.location.href = url;
}

function onPageLoad() {
    if (window.location.search.length > 0) {
        handleRedirect();
    }
    else {
        getArtists();
        getSongs();
    }
}

function handleRedirect() {
    let code = getCode();
    fetchAccessToken(code);
    window.history.pushState("", "", redirect_uri);
}

function getCode() {
    let code = null;
    const query = window.location.search;
    if (query.length > 0) {
        const urlParams = new URLSearchParams(query);
        code = urlParams.get('code')
    }
    return code;
}

function fetchAccessToken(code) {
    let body = "grant_type=authorization_code";
    body += "&code=" + code;
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + clientID;
    body += "&client_secret=" + clientSecret;
    callAuthApi(body);
}

function callAuthApi(body) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(clientID + ":" + clientSecret));
    xhr.send(body);
    xhr.onload = handleAuthResponse;
}

function refreshAccessToken() {
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + clientID;
    callAuthApi(body);
}

function handleAuthResponse() {
    if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        if (data.access_token != undefined) {
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if (data.refresh_token != undefined) {
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        getSongs();
        getArtists();
    } else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function getSongs() {
    callApi("GET", buildRequest(TRACKS), null, handleSongResponse);
}

function getArtists() {
    console.log('getArtists');
    callApi("GET", buildRequest(ARTISTS), null, handleArtistResponse);
}

function callApi (method, url, body, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("access_token"));
    xhr.send(body);
    xhr.onload = callback;
}

function handleSongResponse() {
    if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        console.log(data);
        songList(data);
    } else if (this.status == 401) {
        refreshAccessToken();
    } else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function handleArtistResponse() {
    if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        console.log(data);
        artistList(data);
    } else if (this.status == 401) {
        refreshAccessToken();
    } else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

// function displayData(songs, artists) {
//     rankingList.innerHTML = '';
//     favSongList.innerHTML = '';
//     favArtistist.innerHTML = '';
//     for (i = 0; i < data.items.length; i++) {
//         const song = document.createElement('li');
//         const rank = document.createElement('li');
//         const artist = document.createElement('li');
//         song.innerHTML = songs.items[i].name;
//         artist.innerHTML = artist.items[i].name;
//         rank.innerHTML = i+1;
//         favSongList.appendChild(song);
//         rankingList.appendChild(rank);
//     }
// }

function artistList(data) {
    favArtistList.innerHTML = '';
    for (i = 0; i < data.items.length; i++) {
        const artist = document.createElement('li');
        artist.innerHTML = data.items[i].name;
        favArtistList.appendChild(artist);
    }
}

function songList(data) {
    rankingList.innerHTML = '';
    favSongList.innerHTML = '';
    for (i = 0; i < data.items.length; i++) {
        const song = document.createElement('li');
        const rank = document.createElement('li');
        song.innerHTML = data.items[i].name;
        rank.innerHTML = i+1;
        favSongList.appendChild(song);
        rankingList.appendChild(rank);
    }
}