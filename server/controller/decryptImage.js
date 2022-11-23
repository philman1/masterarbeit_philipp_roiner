const fs = require("fs");
const path = require("path");
const upload = require("../middleware/upload");
const crypto = require("../middleware/crypto");

const decryptImage = async (req, res, next) => {
	console.log(req.body);
	if(!req.body.data) return res.send({msg: "no cid provided"});
	const d = await crypto.downloadFileDecrypted(req.body.data);
	// to buffer
	const buff = Buffer.from(d).toString("base64");
	res.send({msg: "success", buff});
};

module.exports = {
	decryptImage: decryptImage,
};
