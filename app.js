// Use express
const express = require("express");
const app = express();
const port = 8888;

// Use the following for directories
app.use(express.static('/public/'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/images', express.static(__dirname + '/public/images'));
app.use('/callback', express.static(__dirname + '/public'));
app.use(express.json());

// Landing page
app.get('', (req, res) => {
  res.render(__dirname + '/views/landingpage.ejs');
})

// After login
app.get('/callback', (req, res) => {
  res.render(__dirname + '/views/main.ejs');
})

// Listen for requests
app.listen(port, () => console.info(`http://localhost:${port}`));