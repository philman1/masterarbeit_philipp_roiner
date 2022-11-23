const fs = require("fs");
const path = require("path");
const upload = require("../middleware/upload");
const encrypt = require("../middleware/crypto");
const image = require("../middleware/image");
const sizeOf = require("image-size");

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
				const fileNames = await fs.promises.readdir(directoryPath);
				const filePaths = fileNames.map((name) =>
					path.join(__dirname, "../upload/", name)
				);

				const files = await Promise.all(
					filePaths.map(async (filePath) => {
						return {
							name: path.parse(filePath).name,
							buff: await fs.promises.readFile(filePath),
							dim: await sizeOf(filePath),
						};
					})
				);

				const encryptedFiles = await encrypt.encryptFiles(files);
				const cidsEncrypted = await upload.toIpfs(encryptedFiles, "encrypted");

				const thumbnails = await image.createThumbnails(files);
				const cidsThumbnails = await upload.toIpfs(thumbnails, "thumbnail");

				filePaths.forEach((filePath) => {
					fs.unlink(filePath, (err) => {
						if (err) {
							console.error(err);
							return;
						}
					});
				});

				if (cidsEncrypted.length <= 0 || cidsThumbnails.length <= 0) {
					return res.send({ msg: "sth went wrong" });
				} else {
					return res.send({
						msg: `Files has been uploaded.`,
						data: { cidsEncrypted, cidsThumbnails },
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
