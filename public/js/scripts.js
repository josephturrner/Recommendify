// Redirect URL Spotify will send user back to after authorization
var redirect_uri = 'http://localhost:8888/callback/';

// Developer secrets given by Spotify API
var clientID = 'de1edab117b649a58d1e84d1ef7ce560'; // Your client id
var clientSecret = '6232df2c5d28412b93837c891ac88214'; // Your secret

// Authorization API endpoint
const AUTHORIZE = "https://accounts.spotify.com/authorize";

// Base of all Spotify API requests
const BASE = "https://api.spotify.com/v1";
// Endpoint to fetch a authorization token
const TOKEN = "https://accounts.spotify.com/api/token";
// Unfinished artists endpoint (see buildRequest())
const ARTISTS = "https://api.spotify.com/v1/me/top/artists";
// Unfinished tracks endpoint (see buildRequest())
const TRACKS = "https://api.spotify.com/v1/me/top/tracks";
// Unfinished recommendations endpoint (see buildRecRequest())
const RECS = "https://api.spotify.com/v1/recommendations";

// HTML elements to be used
// Song list
const favSongList = document.getElementById('favorite-song-list');
// Artist list
const favArtistList = document.getElementById('favorite-artist-list');
// Recommendations list
const recList = document.getElementById('recommended-list');
// Table element to add headers and scroll to the element on submission
const table = document.getElementById('info-table');
// Headers to be filled after a request was sent
const heads = ['Top Artists', 'Top Songs', 'Recommendations'];
// Used for 'offset': Decided against it because it causes issues in the 'limit' variable for the spotify API calls
// const start = document.getElementById('start');
// Number of items to be fetched: consistent across artists, songs, and recommendations
const number = document.getElementById('nosong');
// Time range to fetch from: consistent across artists and songs
const time = document.getElementById('timerange');

const seedList = document.getElementById('seed-list');

const seedHeader = document.getElementById('seed-header');

// Unused for now
let songData;
let artistData;

let seeds = 0;

// Vars to store the seeds for the recommendation requests: needed because the info needs to be globally available
// Could use callback functions, but we chose against it
// let songSeed = "";
let genreSeed = "";
// let artistSeed = "";
let songSeed = [];
let artistSeed = [];

// Used for creating the headers in the table; the headers should only be created once
let submissions = 0;

function toggleAddArtist(index) {
    const inputButton = document.getElementById(`artist-${index}`);

    if (inputButton.classList.contains('selected')) {
        console.log('Removing artist seed ' + artistData.items[index].id);
        inputButton.classList.toggle('selected');
        inputButton.innerText = '+';
        artistSeed = artistSeed.filter(a => a !== artistData.items[index].id);
        console.log(artistSeed);
        seeds--;
        const l = document.getElementById(`artist-seed-${index}`);
        l.remove();

        if (seeds == 0) {
            seedHeader.innerText = '';
        }

    } else if (seeds < 5) {
        console.log('Adding artist seed ' + artistData.items[index].id);
        inputButton.classList.toggle('selected');
        inputButton.innerText = '-';
        artistSeed.push(artistData.items[index].id);
        console.log(artistSeed);

        if (seeds == 0) {
            seedHeader.innerText = 'Seeds:'
        }

        seeds++;
        const l = document.createElement('li');
        l.id = `artist-seed-${index}`
        l.innerText = `${artistData.items[index].name}`;
        l.classList.add('seed-item');
        seedList.appendChild(l);
    } else {
        alert('Maximum number of seeds selected (max = 5). Remove 1 to add another or submit.');
    }
}

function toggleAddSong(index) {
    const inputButton = document.getElementById(`song-${index}`);

    if (inputButton.classList.contains('selected')) {
        console.log('Removing song seed ' + songData.items[index].id);
        inputButton.classList.toggle('selected');
        inputButton.innerText = '+';
        songSeed = songSeed.filter(a => a !== songData.items[index].id);
        console.log(songSeed);
        seeds--;
        const l = document.getElementById(`song-seed-${index}`);
        l.remove();

        if (seeds == 0) {
            seedHeader.innerText = '';
        }

    } else if (seeds < 5) {
        console.log('Adding song seed ' + songData.items[index].id);
        inputButton.classList.toggle('selected');
        inputButton.innerText = '-';
        songSeed.push(songData.items[index].id);
        console.log(songSeed);

        if (seeds == 0) {
            seedHeader.innerText = 'Seeds:'
        }

        seeds++;
        const l = document.createElement('li');
        l.id = `song-seed-${index}`
        l.innerText = `${songData.items[index].name}`;
        l.classList.add('seed-item');
        seedList.appendChild(l);
    } else {
        alert('Maximum number of seeds selected (max = 5). Remove 1 to add another or submit.');
    }
}


/**
 * Authorization functions used to login using Spotify API
 */

// Builds url for authorization request and sends user to endpoint. Spotify takes care of the authentication
function authorize() {
    let url = AUTHORIZE;
    url += "?client_id=" + clientID;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-read-playback-state user-top-read";
    window.location.href = url;
}

/**
 * Input functions: Called when the user submits the parameters
 */

// Checks that the input values are valid
function checkInput() {
    if (number.value >= Number(number.min) && number.value <= Number(number.max)) {
        return true;
    }
    return false
}

// Builds url for api request from a base endpoint url: used for artists and songs, since the requests use the same formatting
function buildRequest(baseURL) {
    let url = baseURL;
    url += '?';
    // url += `offset=${start.value}`;
    url += 'offset=0';
    url += `&limit=${number.value}`;
    url += `&time_range=${time.value}`;
    return url;
}

// Builds url for api request from the global RECS endpoint; only used by the recommendations flow
function buildRecRequest() {
    console.log('Artist Seeds:', artistSeed.toString());
    console.log('Song Seeds:', songSeed.toString());
    let url = RECS;
    url += '?';
    url += `limit=${number.value}`;
    url += `&seed_artists=${artistSeed.toString()}`;
    url += `&seed_genres=${genreSeed}`;
    url += `&seed_tracks=${songSeed.toString()}`;
    return url;
}

// Scrolls the table to the top of the screen to display results
function scrollToTable() {
    songSeed = [];
    artistSeed = [];
    seeds = 0;
    seedList.innerHTML = '';
    seedHeader.innerText = '';
    window.scrollTo({
        top: table.offsetTop,
        behavior: 'smooth'
    });
}

// Called when user clicks "Submit" buttton: main flow
function loadData() {

    // Ensures input values are valid
    if (checkInput()) {

        // Only create headers on the first submission
        if (submissions == 0) {
            const thead = document.createElement('thead');
            for (i = 0; i < heads.length; i++) {
                const head = document.createElement('th');
                head.innerHTML = heads[i];
                thead.appendChild(head);
            }
            table.insertBefore(thead, table.firstChild);
    
            submissions++;
        }
    
        // Handle redirect if there is a search query within url
        if (window.location.search.length > 0) {
            handleRedirect();
        }
        // Fetch data and display
        else {
            getSongs()
                .then(() => {
                    return getArtists();
                })
                .then(() => {
                    return getRecs();
                })
            setTimeout(() => {
                scrollToTable();
            }, 500);
        }
    }
}

function handleRedirect() {
    let code = getCode();
    fetchAccessToken(code);
    window.history.pushState("", "", redirect_uri);
}

// Gets code from url on Spotify redirect, used to fetch Access Token
function getCode() {
    let code = null;
    const query = window.location.search;
    if (query.length > 0) {
        const urlParams = new URLSearchParams(query);
        code = urlParams.get('code')
    }
    return code;
}

// Fetch access token given the code from Spotify
function fetchAccessToken(code) {
    // Build url
    let body = "grant_type=authorization_code";
    body += "&code=" + code;
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + clientID;
    body += "&client_secret=" + clientSecret;
    callAuthApi(body);
}

// Make POST request to Spotify for authorization code
function callAuthApi(body) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(clientID + ":" + clientSecret));
    xhr.send(body);
    xhr.onload = handleAuthResponse;
}

// Handles POST response from Spotify
function handleAuthResponse() {
    // Success
    if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        // Set access_token in local storage
        if (data.access_token != undefined) {
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        // Set refresh_token in local storage
        if (data.refresh_token != undefined) {
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }

        // Get and display data 
        getSongs()
            .then(() => {
                return getArtists();
            })
            .then(() => {
                return getRecs();
            })
            setTimeout(() => {
                scrollToTable();
            }, 500);
    // Failed POST
    } else {
        // Log error
        console.log(this.responseText);
        alert(this.responseText);
    }
}

// Refreshes the access token using same formatting as fetchAccessToken
function refreshAccessToken() {
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + clientID;
    callAuthApi(body);
}

// GET request to get songs
function getSongs() {
    return new Promise(resolve => {
        callApi("GET", buildRequest(TRACKS), null, handleSongResponse);
        resolve();
    });
}

// GET request to get artists
function getArtists() {
    return new Promise(resolve => {
        callApi("GET", buildRequest(ARTISTS), null, handleArtistResponse);
        resolve();
    });
}

// GET request to get recommendations
function getRecs() {
    return new Promise(resolve => {
        callApi("GET", buildRecRequest(), null, handleRecsResponse);
        resolve();
    });
}

// Formats and sends http requests using parameters
function callApi (method, url, body, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("access_token"));
    xhr.send(body);
    xhr.onload = callback;
}

// Handles responses for artists; used as callback function in GET request
function handleArtistResponse() {

    // Success
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

// Handles responses for songs; used as callback function in GET request
function handleSongResponse() {

    // Success
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

// Handles responses for recommendations; used as callback function in GET request
function handleRecsResponse() {
    if (this.status == 200) {
      var data = JSON.parse(this.responseText);
      console.log(data);
      recommendList(data);
    } else if (this.status == 401) {
      refreshAccessToken();
    } else if (this.status == 400) {
        // Invalid request will only return when the other functions have not completed, so keep running until it works
        getRecs();
    } else {
      console.log(this.responseText);
      alert(this.responseText);
    }
}

// Creates the HTML code for the artists. Also updates the artist and genre seeds to be used in the recommendation API request
function artistList(data) {

    artistData = data;

    // If it isn't custom
    if (seeds == 0) {
        console.log('Getting artist seeds');
        // Randomly select returned artists to be used as seed in the recommendation API request
        for (i = 0; i < 2; i++) {
            let ran = Math.floor(Math.random() * 10);
            artistSeed.push(`${data.items[ran].id}`);
        }
    }

    // Option to change the recommendation criteria to use genre as well; would require some rewrites in songSeed and artistSeed because only 5 total seds are allowed
    // genreSeed = `${data.items[0].genres[0]}`

    // Format HTML
    favArtistList.innerHTML = '';
    for (i = 0; i < data.items.length; i++) {
        const artist = document.createElement('li');
        artist.classList.add('display-item');
        artist.innerHTML = `<button id="artist-${i}" class="add artist" onclick="toggleAddArtist(${i})">+</button><div class='item-grouping'><img class='artist-img' src='${data.items[i].images[0].url}' alt=''></img><h3 class='artist-name'><a href='${data.items[i].external_urls.spotify}'>${data.items[i].name}</a></h3></div>`;
        favArtistList.appendChild(artist);
    }
}

// Creates the HTML code for the songs. Also updates the song seed to be used in the recommendation API request
function songList(data) {

    songData = data;

    if (seeds == 0) {
        console.log('Getting song seeds');
        // Randomly select returned artists to be used as seed in the recommendation API request
        for (i = 0; i < 3; i++) {
            let ran = Math.floor(Math.random() * 10);
            songSeed.push(`${data.items[ran].id}`);
        }
    }

    // Format HTML
    favSongList.innerHTML = '';
    for (i = 0; i < data.items.length; i++) {
        const song = document.createElement('li');
        song.classList.add('display-item');
        song.innerHTML = `<button id="song-${i}" class="add song" onclick="toggleAddSong(${i})">+</button><div class='item-grouping'><img class='song-img' src='${data.items[i].album.images[0].url}' alt=''></img><h3 class='song-name'><a href='${data.items[i].external_urls.spotify}'>${data.items[i].name}</a></h3></div>`;
        favSongList.appendChild(song);
    }
}

// Create HTML code for the recommendations list
function recommendList(data) {

    recList.innerHTML = '';
    for (i = 0; i < data.tracks.length; i++) {
        const rec = document.createElement('li');
        rec.classList.add('display-item');
        rec.innerHTML = `<img class='song-img' src='${data.tracks[i].album.images[0].url}' alt=''></img><h3 class='song-name'><a href='${data.tracks[i].external_urls.spotify}'>${data.tracks[i].name}</a></h3>`;
        recList.appendChild(rec);
    }

    // songSeed = [];
    // artistSeed = [];
    // seeds = 0;
    // seedList.innerHTML = '';
    // seedHeader.innerText = '';
}

// Using python recommendation algorithm
// function songDict(data) {
//   trackListDict = "";
//   trackDict = {};
//   title = "";
//   year = "";
//   for (i = 0; i < data.items.length; i++) {
//     title = data.items[i].name;
//     year = data.items[i].album.release_date;
//     year = Number(year.slice(0, 4));
//     console.log(year);
//     trackDict = {
//       'name': title,
//       'year': year,
//     }
//     const trackListDict = document.createElement("li");
//     trackListDict.append(trackDict);
//   }
//   let recommendations = runPythonScript(trackDict);

//   recommendList(recommendations);
// }

// async function sendTrackData(trackListDict) {
//     console.log(JSON.stringify(trackListDict));
//     const response = await fetch("http://localhost:8888/callback", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(trackListDict),
//     });

//     const recommendations = await response.json();

//     recommendList(recommendations);
// }
