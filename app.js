require("dotenv").config();
const finnhub = require("finnhub");
const express = require("express");
const http = require("http");
const app = express();

// init socket.io
const server = http.createServer(app);
const io = require("socket.io")(server);

// Set up express static folder
app.use(express.static("static"));

// Routes
app.get("/", (req, res) => {
	res.sendFile(__dirname + "static/index.html");
});

io.on("connection", (socket) => {
	console.log(`User Connected`);

  socket.on('API_CALL', () => {
    console.log("GETTING DATA")
    // getQuotes()
    // .then((data) => {
    //   console.log("SENDING DATA")
    //   io.emit('SEND_DATA', data)
    // })
  })

	socket.on("disconnect", () => {
		console.log("User Disconnected");
	});
});

let getQuotes = () => {
  const api_key = finnhub.ApiClient.instance.authentications['api_key'];
  api_key.apiKey = ""
  const finnhubClient = new finnhub.DefaultApi()

  let promises = []

  promises.push(
    new Promise((resolve, reject) => {
      finnhubClient.quote('AAPL', (error, data, response) => {
        resolve({
          "name": "Apple",
          "data": {
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
          "name": "Gamestop",
          "data": {
            "current": data['c'],
            "high": data['h'],
            "low": data['l']
          }
        })
      })
    })
  )

  Promise.all(promises).then(data => {
    return data
  })
  .catch(err => {
    console.log(err)
  })
}

const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
