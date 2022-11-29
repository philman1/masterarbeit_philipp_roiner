import crypto from "crypto";
import ipfsClient from "ipfs-http-client";
import { getEntry } from "../db/index.js";
const ipfsEndPoint = "http://127.0.0.1:5001";
const ipfs = ipfsClient(ipfsEndPoint);

export async function encryptFiles(files) {
	try {
		let encryptedFiles = [];

		//listing all files using forEach
		files.map(async ({ name, buff }) => {
			const key = crypto.randomBytes(16).toString("hex"); // 16 bytes -> 32 chars
			const iv = crypto.randomBytes(8).toString("hex"); // 8 bytes -> 16 chars
			const ebuff = encryptAES(buff, key, iv);

			encryptedFiles.push({
				name: name,
				key: key,
				buff: Buffer.concat([
					Buffer.from(iv, "utf8"), // char length: 16
					Buffer.from(ebuff, "utf8"),
				]),
			});
		});

		return encryptedFiles;
	} catch (err) {
		console.log(err);
		throw err;
	}
}

export async function downloadFileDecrypted(cid) {
	try {
		const chunks = [];
		for await (const chunk of ipfs.cat(cid)) {
			chunks.push(chunk);
		}

		const edata = Buffer.concat(chunks);
		const key = await getEntry(cid)[0]["aes_key"];
		console.log(key);
		const iv = edata.slice(0, 16).toString("utf8");
		const econtent = edata.slice(16).toString("utf8");
		const ebuf = Buffer.from(econtent, "hex");
		const content = decryptAES(ebuf, key, iv);

		return content;
	} catch (err) {
		console.log(err);
		throw err;
	}
}

function encryptAES(buffer, secretKey, iv) {
	const cipher = crypto.createCipheriv("aes-256-ctr", secretKey, iv);
	const data = cipher.update(buffer);
	const encrypted = Buffer.concat([data, cipher.final()]);
	return encrypted.toString("hex");
}

function decryptAES(buffer, secretKey, iv) {
	const decipher = crypto.createDecipheriv("aes-256-ctr", secretKey, iv);
	const data = decipher.update(buffer);
	const decrpyted = Buffer.concat([data, decipher.final()]);
	return decrpyted;
}
