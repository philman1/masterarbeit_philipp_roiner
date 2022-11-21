const fs = require("fs");
const path = require("path");
const upload = require("../middleware/upload");
const encrypt = require("../middleware/encrypt");

const multipleUpload = async (req, res, next) => {
	try {
		await upload.toFs(req, res, async (err) => {
			if (err) {
				return res.send(err);
			} else {
				if (req.files.length <= 0) {
					return res.send(`You must select at least 1 file.`);
				}
				const directoryPath = path.join(__dirname, "../upload");
				const filePaths = await fs.promises.readdir(directoryPath);

				const files = await encrypt.encryptFiles(filePaths);

				const cids = await upload.toIpfs(files);
				console.log(cids);
				filePaths.forEach((filename) => {
					const p = path.join(__dirname, "../upload/", filename);
					fs.unlink(p, (err) => {
						if (err) {
							console.error(err);
							return;
						}
					});
				});

				if (cids.length <= 0) {
					return res.send({ msg: "sth went wrong" });
				} else {
					return res.send({
						msg: `Files has been uploaded.`,
						data: cids,
					});
				}
			}
		});
	} catch (error) {
		console.log(error);

		if (error.code === "LIMIT_UNEXPECTED_FILE") {
			return res.send("Too many files to upload.");
		}
		return res.send(`Error when trying upload many files: ${error}`);
	}
};

module.exports = {
	multipleUpload: multipleUpload,
};
