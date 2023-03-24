// import querystring from 'query-string';

var redirect_uri = 'http://localhost:8888/callback/';

var clientID = 'de1edab117b649a58d1e84d1ef7ce560'; // Your client id
var clientSecret = '6232df2c5d28412b93837c891ac88214'; // Your secret

const AUTHORIZE = "https://accounts.spotify.com/authorize";

const TOKEN = "https://accounts.spotify.com/api/token";
const ARTISTS = "https://api.spotify.com/v1/me/top/artists?offset=0&limit=10&time_range=short_term"
const TRACKS = "https://api.spotify.com/v1/me/top/tracks?offset=0&limit=5&time_range=short_term"
// const TRACKS = "https://api.spotify.com/v1/me/top/tracks"

const rankingList = document.getElementById('ranking-list');
const trackList = document.getElementById('favorite-list');
const start = document.getElementById('startsong');
const number = document.getElementById('nosong');
const time = document.getElementById('timerange');


function buildRequest() {
    let url = TRACKS;
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
    // let body = "grant_type=client_credentials";
    body += "&code=" + code;
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + clientID;
    body += "&client_secret=" + clientSecret;

    // const head = {
    //     headers: {
    //         'Content-Type':'application/x-www-form-urlencoded'
    //     }
    // }

    // let bod = {
    //     grant_type: "client_credentials",
    //     code: code,
    //     redirectUri: encodeURI(redirect_uri),
    //     client_id: clientID,
    //     client_secret: clientSecret
    // }

    // let header = querystring.stringify(head)
    // let body = querystring.stringify(bod)
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
    } else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function getSongs() {
    callAuthApi("GET", TRACKS, null, handleSongResponse);
}

// function callApi (method, url, body, callback) {
//     let xhr = new XMLHttpRequest();
//     xhr.open(method, url, true);
//     xhr.setRequestHeader('Content-Type', 'application/json');
//     xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("access_token"));
//     xhr.send(body);
//     xhr.onload = callback;
// }

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

function songList(data) {
    rankingList.innerHTML = '';
    trackList.innerHTML = '';
    for (i = 0; i < data.items.length; i++) {
        const song = document.createElement('li');
        const rank = document.createElement('li');
        song.innerHTML = data.items[i].name;
        rank.innerHTML = i+1;
        trackList.appendChild(song);
        rankingList.appendChild(rank);
    }
}