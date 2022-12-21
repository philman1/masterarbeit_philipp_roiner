import { fetchLicenses, fetchImageAccount } from "./workspace.js";
import { authorizedPk } from "./web3Auth.js";

/**
 * Checks if the user has a valid license for a given image.
 * @param req - the request object
 * @param res - the response object
 * @param next - the next middleware function in the stack
 * @returns the next() function.
 */
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
