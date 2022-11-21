const express = require("express");
const router = express.Router();
const uploadController = require("./controller/upload");
const decryptImageController = require("./controller/decryptImage");

let routes = (app) => {
	router.post("/multiple-upload", uploadController.multipleUpload);
	// router.post("/decrypt-image", decryptImageController.decryptImage);

	return app.use("/", router);
};

module.exports = routes;
