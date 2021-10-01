$(document).ready(() => {
	const socket = io.connect();
	console.log(socket);

	document.getElementById("refresh-stocks-btn").addEventListener("click", function () {
		console.log("Button was clicked");
		socket.emit("API_CALL");
	});

	socket.on("SEND_DATA", (data) => {
		console.log(`Recieved data: ${data}`);
		// Erase old containers
		$("#stock-container").empty();
		// Create new containers
		for (let i = 0; i < data.length; i++) {
			$("#stock-container").append(`
            <div class="stock-card">
                <p>${data[i]["name"]}</p>
                <p>Current price: ${data[i]["data"]["current"]}</p>
                <p>High price: ${data[i]["data"]["high"]}</p>
                <p>Low price: ${data[i]["data"]["low"]}</p>
            </div>
            `);
		}
	});
});
