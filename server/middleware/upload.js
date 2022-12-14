import multer from "multer";
import ipfsClient from "ipfs-http-client";
const ipfsEndPoint = "http://127.0.0.1:5001";
const ipfs = ipfsClient(ipfsEndPoint);

/* Creating a storage object for multer to use. */
var storage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, "./upload");
	},
	filename: (req, file, callback) => {
		const match = ["image/png", "image/jpeg"];

		if (match.indexOf(file.mimetype) === -1) {
			var message = `${file.originalname} is invalid. Only accept png/jpeg.`;
			return callback(message, null);
		}

		var filename = `${Date.now()}-${file.originalname}`;
		callback(null, filename);
	},
});

/* Creating a multer middleware that will store the files in the upload folder. */
export const toFs = multer({ storage: storage }).array("data", 10);

/**
 * Writes the given files to the IPFS at the given path
 * @param files - Files to upload
 * @param path - The path to the folder on IPFS
 * @returns CIDs of the files recently added on the IPFS.
 */
export const toIpfs = async (files, path) => {
	const getCids = async () => {
		const cids = [];
		for await (const file of ipfs.files.ls(`/images/${path}`)) {
			const f = files.find((f) => f.name === file.name);
			if (f)
				cids.push({
					cid: file.cid.toString(),
					key: f.key ? f.key : "",
				});
		}
		return cids;
	};

	await Promise.all(
		files.map(async (f) => {
			return await ipfs.files.write(`/images/${path}/` + f.name, f.buff, {
				create: true,
				parents: true,
			});
		})
	);

	return await getCids();
};
