$(document).ready(() => {
	const socket = io.connect();

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
                <h2 style="text-align: center;">${data[i]["name"]}</h2>
                <ul>
                <li>Current price: ${data[i]["data"]["current"]}</li>
                <li>High price: ${data[i]["data"]["high"]}</li>
                <li>Low price: ${data[i]["data"]["low"]}</li>
                </ul>
            </div>
            `);
		}
	});
});
