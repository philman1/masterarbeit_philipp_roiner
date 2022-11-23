const multer = require("multer");
const ipfsClient = require("ipfs-http-client");
const ipfsEndPoint = "http://localhost:5001";
const ipfs = ipfsClient(ipfsEndPoint);

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

var uploadFilesToFs = multer({ storage: storage }).array("data", 10);
// var uploadFilesMiddleware = util.promisify(uploadFiles);

const uploadEncryptedFilesToIpfs = async (files) => {
	const getCids = async () => {
		const cids = [];
		for await (const file of ipfs.files.ls("/encrypted/images")) {
			if (files.map((f) => f.name).includes(file.name))
				cids.push(file.cid.toString());
		}
		return cids;
	};

	await Promise.all(
		files.map(async (f) => {
			return await ipfs.files.write(
				"/encrypted/images/" + f.name,
				f.buff,
				{
					create: true,
					parents: true,
				}
			);
		})
	);

	return await getCids();
};

module.exports = {
	toFs: uploadFilesToFs,
	toIpfs: uploadEncryptedFilesToIpfs,
};
