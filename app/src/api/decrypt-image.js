export const loadDecryptedImage = async () => {
	await fetch("http://localhost:3000/decrypt-image", {
		headers: {
			"Connection-Type": "application/json",
		},
		method: "POST",
		body: JSON.stringify({
			data: "QmfQpdhbu41fqHNpH36NgD9NmXYA4WaB7RZfQSR3hNKwJU",
		}),
	})
		.then((res) => res.json())
		.then((json) => console.log(json));
};
