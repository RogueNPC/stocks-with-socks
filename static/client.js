$(document).ready(() => {
	const socket = io.connect();

	let user_id;

	document.getElementById("email-submit").addEventListener("click", (e) => {
		e.preventDefault();
		let email = document.getElementById("email-input").value;
		console.log(`Email: ${email}`);
		console.log(`User id: ${user_id}`);
		socket.emit("SEND_EMAIL", [user_id, email]);

		// erase input field and button
		document.getElementById("email-input").remove();
		document.getElementById("email-submit").remove();

		// Add verification code input
		$("#stock-container").append(
			`
			<p>${user_id}</p>
			<input id="verification-input" type="text" placeholder="Verification code">
			<button id="verification-submit">Verify</button>
			`
		);

		// Add listener for verification code input
		document.getElementById("verification-submit").addEventListener("click", (e) => {
			e.preventDefault();
			let code = document.getElementById("verification-input").value;
			socket.emit("VERIFY_CODE", [user_id, code]);
		});
	});

	// document.getElementById("refresh-stocks-btn").addEventListener("click", function () {
	// 	console.log("Button was clicked");
	// 	socket.emit("API_CALL");

	// 	setInterval(() => {
	// 		console.log("Refreshing data");
	// 		socket.emit("API_CALL");
	// 	}, 5000);
	// });

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

	socket.on("SEND_USER_ID", (userId) => {
		console.log(`Setting user id to ${userId}`);
		user_id = userId;
	});

	socket.on("GOOD_CODE", () => {
		$("#stock-container").empty();
		socket.emit("API_CALL");

		setInterval(() => {
			console.log("Refreshing data");
			socket.emit("API_CALL");
		}, 5000);
	});

	socket.on("BAD_CODE", () => {
		console.log("Bad code entered.");
	});
});
