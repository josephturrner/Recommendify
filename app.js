const express = require("express");
const app = express();
const port = 8888;
const root = __dirname;

app.use(express.static("/public/"));
app.use("/css", express.static(__dirname + "/public/css"));
app.use("/js", express.static(__dirname + "/public/js"));
app.use("/images", express.static(__dirname + "/public/images"));
app.use("/callback", express.static(__dirname + "/public"));
app.use(express.json());

app.get("", (req, res) => {
  res.render(__dirname + "/views/landingpage.ejs");
});

app.get("/callback", (req, res) => {
  res.render(__dirname + "/views/main.ejs");
});

/* Get data from website and send result from Python script */
app.post("/callback", async (req, res) => {
  const data = req.body;

  const result = await runPythonScript(data);

  res.send(result);
});

app.listen(port, () => console.info(`http://localhost:${port}`));

/* Run Python model on website*/
async function runPythonScript(data) {
  const { spawn } = require("child_process");

  /* Has to be python installation path */
  const pythonProcess = spawn(
    "C:\\Users\\powellt1\\AppData\\Local\\Programs\\Python\\Python311\\python.exe",
    ["recommendation/model.py", JSON.stringify(data)]
  ); 

  return new Promise((resolve, reject) => {
    pythonProcess.stdout.on("data", (data) => {
      resolve(JSON.parse(data));
    });

    pythonProcess.stderr.on("data", (data) => {
      reject(new Error(`Error running Python script: ${data}`));
    });
  });
}
