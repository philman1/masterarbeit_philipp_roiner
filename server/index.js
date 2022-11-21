const ipfsClient = require("ipfs-http-client");
// const { globSource } = ipfsClient;
const ipfsEndPoint = "http://localhost:5001";
const ipfs = ipfsClient(ipfsEndPoint);

const fs = require("fs");
const initRoutes = require("./routes");

// generateKeys();
// _testing()

async function _testing() {
	const file = "package.json"; // file to upload
	const ipfspath = "/encrypted/data/" + file; // ipfspath

	// upload to ipfs path
	await uploadFileEncrypted(file, ipfspath);

	// download from ipfs path
	const dl = await downloadFileEncrypted(ipfspath);

	// to buffer
	const buff = Buffer.from(dl, "hex");

	// save buffer to file
	const outfile = ipfspath.replace(/\//g, "_");
	console.log("writing:", outfile);
	fs.writeFile(outfile, buff, function (err) {
		if (err) throw err;
	});
}

////////////////////////////////
///////// REST API /////////////
////////////////////////////////

const rest_port = 3000;
const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.urlencoded({ extended: true }));

// enable CORS
app.use(cors());

initRoutes(app);

// app.get("/", (req, res) => {
// 	res.sendFile(__dirname + "/index.html");
// });

// app.get("/api/files", async (req, res, next) => {
// 	try {
// 		res.json(await getUploadedFiles());
// 	} catch (e) {
// 		// when /encrypted/ path not exists (~ no uploads): catch ipfs http error
// 		res.json({ error: e.toString() });
// 	}
// });

// app.get(/^\/api\/file(\/.*)$/, async (req, res, next) => {
// 	try {
// 		const ipfspath = req.params[0];
// 		const content = await downloadFileEncrypted(ipfspath);
// 		res.send(content);
// 	} catch (err) {
// 		res.send("error: " + err);
// 	}
// });

app.listen(rest_port, () => {
	console.log("Server running on port 3000");
});

////////////////////////////////
////////////////////////////////
////////////////////////////////
