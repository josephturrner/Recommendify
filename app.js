const express = require("express");
const app = express();
const port = 8888;
const root = __dirname;

app.use(express.static('/public/'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/images', express.static(__dirname + '/public/images'));
app.use('/callback', express.static(__dirname + '/public'));
app.use('/recommendation', express.static(__dirname + '/recommendation'))
app.use(express.json());

app.get('', (req, res) => {
    res.render(__dirname + '/views/landingpage.ejs');
})

app.get('/callback', (req, res) => {
    res.render(__dirname + '/views/main.ejs');
})

app.get("/callback", (req, res) => {
  res.render(__dirname + "/views/main.ejs");
});

app.listen(port, () => console.info(`http://localhost:${port}`));
