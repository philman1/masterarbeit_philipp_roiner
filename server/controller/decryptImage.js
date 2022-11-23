const fs = require("fs");
const path = require("path");
const upload = require("../middleware/upload");
const crypto = require("../middleware/crypto");

const decryptImage = async (req, res, next) => {
	const d = await crypto.downloadFileDecrypted(req.body.data);
	res.send(d);
};

module.exports = {
	decryptImage: decryptImage,
};
