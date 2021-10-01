$(document).ready(() => {
	const socket = io.connect();

	document.getElementById("refresh-stocks-btn").addEventListener("click", function () {
		console.log("Button was clicked");
		socket.emit("API_CALL");
	});

	socket.on("SEND_DATA", (data) => {
		// Erase old containers
		$("#stock-container").empty();

		// Create new containers
		for (let i = 0; i < data.length; i++) {
			let buy;
			if (data[i]["data"]["price"] == "Up") {
				buy = "BUY BUY BUY";
			} else {
				buy = "SELL SELL SELL";
			}

			$("#stock-container").append(`
            <div class="stock-card">
                <h2 style="text-align: center; font-weight: bold;">${data[i]["name"]}</h2>
                <h3 style="text-align: center;">${buy}</h3>
                <ul>
                <li>Current price: ${data[i]["data"]["current"]}</li>
                <li>Opening price: ${data[i]["data"]["open"]}</li>
                <li>High price: ${data[i]["data"]["high"]}</li>
                <li>Low price: ${data[i]["data"]["low"]}</li>
                </ul>
            </div>
            `);
		}
	});
});
