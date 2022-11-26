import { downloadFileDecrypted } from "../middleware/crypto.js";
("../middleware/crypto.js");

export const decryptImage = async (req, res, next) => {
	console.log(req.body);
	if (!req.body.data) return res.send({ msg: "no cid provided" });
	const d = await downloadFileDecrypted(req.body.data);
	// to buffer
	const buff = Buffer.from(d).toString("base64");
	res.send({ msg: "success", buff });
};
