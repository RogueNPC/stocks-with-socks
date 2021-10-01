const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// Set up express static folder
app.use(express.static("static"));

// Routes
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/static/index.html");
});

io.on("connection", (socket) => {
	console.log(`User Connected`);

	socket.on("disconnect", () => {
		console.log("User Disconnected");
	});
});

const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
