const express = require('express');
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

// app.post('/callback', async (req, res) => { 

//     const data = req.body; 

//     const result = await runPythonScript(data);

//     res.send(result); 

// });

     

app.listen(port, () => console.info(`http://localhost:${port}`));

// async function runPythonScript(data) { 

//     const { spawn } = require('child_process'); 

//     const pythonProcess = spawn('recommendation/python.exe', ['recommendation/model.py', JSON.stringify(data)]); /* Has to be python installation path */

//     return new Promise((resolve, reject) => { 

//         pythonProcess.stdout.on('data', (data) => { 

//             resolve(JSON.parse(data)); 

//         }); 

//         pythonProcess.stderr.on('data', (data) => { 

//             reject(new Error(`Error running Python script: ${data}`)); 

//         }); 

//     }); 

// } 
