import { downloadFileDecrypted } from "../middleware/crypto.js";
("../middleware/crypto.js");

/**
 * Decrypts a given image
 * @param req - the request object
 * @param res - the response object
 * @returns The decrypted image.
 */
export const decryptImage = async (req, res) => {
	if (!req.body.data) return res.send({ msg: "no cid provided" });
	const { cid } = req.body.data;
	const d = await downloadFileDecrypted(cid);
	if (d === null) res.send({ msg: "something when wrong." });
	// to buffer
	const buff = Buffer.from(d).toString("base64");
	res.send({ msg: "success", buff });
};
