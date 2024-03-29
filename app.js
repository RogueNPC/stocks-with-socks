require("dotenv").config();
const util = require("util");
const finnhub = require("finnhub");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");

const auth = {
	auth: {
		api_key: process.env.MAILGUN_API_KEY,
		domain: process.env.EMAIL_DOMAIN,
	},
};

const nodemailerMailgun = nodemailer.createTransport(mg(auth));

// Set up express static folder
app.use(express.static("static"));

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/static/index.html");
});

let connectedUsers = {};

io.on("connection", (socket) => {
	// Generate verification code when user joins, store it with userId in connectedUsers obj
	let randNum = Math.floor(Math.random() * (10000 - 1)) + 1;
	connectedUsers[socket.id] = { verification_code: randNum.toString() };
	io.emit("SEND_USER_ID", socket.id);
	console.log(`New connection! Users: ${util.inspect(connectedUsers)}`);

	// --- Recievers ---

	// Recieves email from frontend, adds email to logged in user's object
	socket.on("SEND_EMAIL", (data) => {
		// data[0]: user id
		// data[1]: user email
		connectedUsers[data[0]]["email"] = data[1];
		// send email
		const user = {
			email: data[1],
			verification_code: connectedUsers[data[0]]["verification_code"],
		};

		// Email the user a verification code
		nodemailerMailgun
			.sendMail({
				from: "no-reply@stockswithsocks.com",
				to: user.email,
				subject: "Stocks w/ Socks Verification Code",
				html: `<h1>Verification code: ${user.verification_code}</h1>`,
			})
			.then((res) => {
				console.log(`Response: ${res}`);
			})
			.catch((err) => {
				console.log(`EMAIL ERROR: ${err}`);
			});
	});

	// Checks verification code against what's store in connectedUsers
	socket.on("VERIFY_CODE", (data) => {
		// data[0]: user id
		// data[1]: verification code

		// Return good or bad response
		if (connectedUsers[data[0]]["verification_code"] === data[1]) {
			io.emit("GOOD_CODE", data);
		} else {
			io.emit("BAD_CODE");
		}
	});

	// Sends stock data
	socket.on("API_CALL", () => {
		getQuotes().then((data) => {
			io.emit("SEND_DATA", data);
		});
	});

	// Removes user from connectedUsers on disconnect
	socket.on("disconnect", () => {
		delete connectedUsers[socket.id];
		console.log(`${socket.id} disconnected! ${util.inspect(connectedUsers)}`);
	});
});

const getQuotes = () => {
	const api_key = finnhub.ApiClient.instance.authentications["api_key"];
	api_key.apiKey = process.env.FINNHUB_API_KEY;
	const finnhubClient = new finnhub.DefaultApi();

	return new Promise((resolve, reject) => {
		let promises = [];
		let indexes = ["AAPL", "GME", "AMZN", "TSLA"];

		for (let i = 0; i < indexes.length; i++) {
			promises.push(
				new Promise((resolve, reject) => {
					finnhubClient.quote(indexes[i], (error, data, response) => {
						let price;

						if (error) {
							console.log(error);
							reject({ error: "no data" });
						}

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
				resolve(err);
			});
	});
};

const PORT = 3000;
server.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
