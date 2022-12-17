import { fetchLicenses, fetchImageAccount } from "./workspace.js";
import { authorizedPk } from "./web3Auth.js";
import { SplAssociatedTokenAccountsCoder } from "@project-serum/anchor/dist/cjs/coder/spl-associated-token/accounts.js";

export const licenseAuth = async (req, res, next) => {
	if (!req.body.data) return res.send({ msg: "missing data" });
	const { mint } = req.body.data;
	const licenses = await fetchLicenses(authorizedPk(res), mint);

	const imageAccount = await fetchImageAccount(mint);
	const { account } = imageAccount;

	if (
		licenses.length <= 0 &&
		account &&
		(account.available === false || account.allowedLicenseTypes > 1)
	)
		return res.send({ msg: "no valid license found" });
	console.log("license approved!");
	return next();
};
