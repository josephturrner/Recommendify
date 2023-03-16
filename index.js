const express = require('express');
const app = express();
const port = 8888;
const root = __dirname;

app.use(express.static('public'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/images', express.static(__dirname + '/public/images'));

app.get('', (req, res) => {
    res.sendFile(__dirname + '/pages/index.html');
})

app.get('/callback', (req, res) => {
    res.sendFile(__dirname + '/pages/logged.html');
})

app.listen(port, () => console.info(`Listening on port ${port}`));