import { fetchLicenses } from "./workspace.js";
import { authorizedPk } from "./web3Auth.js";

export const licenseAuth = async (req, res, next) => {
	if (!req.body.data) return res.send({ msg: "missing data" });
	const { mint } = req.body.data;
	const licenses = await fetchLicenses(authorizedPk(res), mint);

	if (licenses.length <= 0) res.send({ msg: "no valid license found" });
	console.log("license approved!");
	return next();
};
