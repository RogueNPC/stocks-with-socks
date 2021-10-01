const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
require("dotenv").config()
const finnhub = require("finnhub")

// Set up express static folder
app.use(express.static("static"));

// Routes
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/static/index.html");
});

app.get("/quotes", (req, res) => {
  const api_key = finnhub.ApiClient.instance.authentications['api_key'];
  api_key.apiKey = ""
  const finnhubClient = new finnhub.DefaultApi()

  let promises = []

  promises.push(
    new Promise((resolve, reject) => {
      finnhubClient.quote('AAPL', (error, data, response) => {
        resolve({
          "Apple": {
            "current": data['c'],
            "high": data['h'],
            "low": data['l']
          }
        })
      })
    })
  )

  promises.push(
    new Promise((resolve, reject) => {
      finnhubClient.quote('GME', (error, data, response) => {
        resolve({
          "Gamestop": {
            "current": data['c'],
            "high": data['h'],
            "low": data['l']
          }
        })
      })
    })
  )

  Promise.all(promises).then(data => {
    console.log(data)
  })
  .catch(err => {
    console.log(err)
  })


})

io.on("connection", (socket) => {
	console.log(`User Connected`);

  socket.emit('API_CALL', (data))

	socket.on("disconnect", () => {
		console.log("User Disconnected");
	});
});

const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
