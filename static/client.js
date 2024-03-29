$(document).ready(() => {
	const socket = io.connect();

	let user_id;

	// Event listener for email input
	document.getElementById("email-submit").addEventListener("click", (e) => {
		e.preventDefault();
		let email = document.getElementById("email-input").value;
		socket.emit("SEND_EMAIL", [user_id, email]);

		// erase input field and button
		document.getElementById("email-input").remove();
		document.getElementById("email-submit").remove();

		// Add verification code input
		$("#stock-container").append(
			`
			<div id="verification" style="display: flex; justify-content: center; width: 75vw">
			<p id="bad-code-warning" style="visibility: hidden;">Wrong verification code. Try again. </p>
			<input id="verification-input" type="text" placeholder="Verification code">
			<button id="verification-submit">Verify</button>
			</div>
			`
		);

		// Add listener for verification code input
		document.getElementById("verification-submit").addEventListener("click", (e) => {
			e.preventDefault();
			let code = document.getElementById("verification-input").value;
			// Verify code with backend
			socket.emit("VERIFY_CODE", [user_id, code]);
		});
	});

	// Recieves stock data from backend
	socket.on("SEND_DATA", (data) => {
		// Erase old containers
		$("#stock-container").empty();

		// Create new containers
		if (data["error"]) {
			$("#stock-container").append(`
			<p>We ran out of api calls. Should probably make a paid account, eh?</p>
			`);
		} else {
			for (let i = 0; i < data.length; i++) {
				let buy;
				if (data[i]["data"]["price"] == "Up") {
					buy = "⬆";
				} else {
					buy = "⬇";
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
		}
	});

	//
	socket.on("SEND_USER_ID", (userId) => {
		user_id = userId;
	});

	// On verification approval, begin updating site with stock data every 10 secs
	socket.on("GOOD_CODE", () => {
		$("#stock-container").empty();
		socket.emit("API_CALL");

		setInterval(() => {
			console.log("Refreshing data");
			socket.emit("API_CALL");
		}, 10000);
	});

	// Throw warning on bad verification code
	socket.on("BAD_CODE", () => {
		console.log("Bad code entered.");
		document.getElementById("bad-code-warning").style.visibility = "visible";
	});
});
