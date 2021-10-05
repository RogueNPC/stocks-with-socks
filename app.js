require("dotenv").config();
const finnhub = require("finnhub");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// Set up express static folder
app.use(express.static("static"));

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/static/index.html");
});

let users = {};

io.on("connection", (socket) => {
	let randNum = Math.floor(Math.random() * (10000 - 1)) + 1;
	users[socket.id] = { verification_code: randNum.toString() };
	console.log(`User ${socket.id}: ${randNum}`);
	console.log(`Users dict: ${users}`);

	io.emit("SEND_USER_ID", socket.id);

	socket.on("VERIFY_EMAIL", (data) => {
		console.log(`${data[0]}'s email: ${data[1]}`);
		// send email
	});

	socket.on("API_CALL", () => {
		getQuotes().then((data) => {
			io.emit("SEND_DATA", data);
		});
	});
});

const getQuotes = () => {
	const api_key = finnhub.ApiClient.instance.authentications["api_key"];
	api_key.apiKey = process.env.API_KEY;
	const finnhubClient = new finnhub.DefaultApi();

	return new Promise((resolve, reject) => {
		let promises = [];
		let indexes = ["AAPL", "GME", "AMZN", "TSLA"];

		for (let i = 0; i < indexes.length; i++) {
			promises.push(
				new Promise((resolve, reject) => {
					finnhubClient.quote(indexes[i], (error, data, response) => {
						let price;

						if (data["c"] >= data["o"]) {
							price = "Up";
						} else {
							price = "Down";
						}

						resolve({
							name: indexes[i],
							data: {
								price: price,
								current: data["c"],
								open: data["o"],
								high: data["h"],
								low: data["l"],
							},
						});
					});
				})
			);
		}

		Promise.all(promises)
			.then((data) => {
				resolve(data);
			})
			.catch((err) => {
				console.log(err);
			});
	});
};

const PORT = 3000;
server.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
