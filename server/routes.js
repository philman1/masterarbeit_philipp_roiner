import express from "express";
const router = express.Router();

import { web3Auth } from "./middleware/web3Auth.js";
import { licenseAuth } from "./middleware/licenseAuth.js";
import { multipleUpload } from "./controller/upload.js";
import { decryptImage } from "./controller/decryptImage.js";

let routes = (app) => {
	router.post(
		"/multiple-upload",
		web3Auth({ action: "upload:images" }),
		multipleUpload
	);
	router.post(
		"/decrypt-image",
		web3Auth({ action: "decrypt:image" }),
		licenseAuth,
		decryptImage
	);

	return app.use("/", router);
};

export default routes;
