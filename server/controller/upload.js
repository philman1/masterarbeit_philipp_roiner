import fs from "fs";
import path from "path";
import sizeOf from "image-size";
import { toFs, toIpfs } from "../middleware/upload.js";
import { encryptFiles } from "../middleware/crypto.js";
import { createThumbnails } from "../middleware/image.js";

import { fileURLToPath } from "url";
import { dirname } from "path";
import { addEntry } from "../db/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Encrypts the given files and uploads the encrypted files together with thumbnails of the files to the IPFS.
 * @param req - the request object
 * @param res - the response object
 * @returns An Object with the uploaded CIDs.
 */
export const multipleUpload = async (req, res) => {
	try {
		await toFs(req, res, async (err) => {
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

				const encryptedFiles = await encryptFiles(files);
				let cidsEncrypted = await toIpfs(encryptedFiles, "encrypted");
				cidsEncrypted.forEach(async ({ cid, key }) => {
					await addEntry(cid, key);
				});

				const thumbnails = await createThumbnails(files);
				let cidsThumbnails = await toIpfs(thumbnails, "thumbnail");

				filePaths.forEach((filePath) => {
					fs.unlink(filePath, (err) => {
						if (err) {
							console.error(err);
							return;
						}
					});
				});

				cidsEncrypted = cidsEncrypted.map((entry) => entry.cid);
				cidsThumbnails = cidsThumbnails.map((entry) => entry.cid);

				if (cidsEncrypted.length <= 0 || cidsThumbnails.length <= 0) {
					return res.send({ msg: "sth went wrong" });
				} else {
					return res.send({
						msg: `Files have been uploaded.`,
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
