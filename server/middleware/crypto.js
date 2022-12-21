import crypto from "crypto";
import ipfsClient from "ipfs-http-client";
import { getEntry } from "../db/index.js";
const ipfsEndPoint = "http://127.0.0.1:5001";
const ipfs = ipfsClient(ipfsEndPoint);

/**
 * Encrypts the given files.
 * @param files - Array of files to be encrypted with the following format [name: String, buff: Buffer]
 * @returns Array with the encrypted files.
 */
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

/**
 * Downloads the encrypted file from IPFS, gets the AES key from the database, decrypts the file,
 * and returns the decrypted file
 * @param cid - The CID of the file you want to download.
 * @returns The file content.
 */
export async function downloadFileDecrypted(cid) {
	try {
		const chunks = [];
		for await (const chunk of ipfs.cat(cid)) {
			chunks.push(chunk);
		}

		const edata = Buffer.concat(chunks);
		const db_entry = await getEntry(cid);
		if (db_entry.length <= 0) return null;
		const key = db_entry[0].aes_key;
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

/**
 * Encrypts a buffer using AES-256-CTR with the AES.
 * @param buffer - The data to be encrypted.
 * @param secretKey - The secret key used to encrypt the data.
 * @param iv - Initialisation vector.
 * @returns The encrypted data.
 */
function encryptAES(buffer, secretKey, iv) {
	const cipher = crypto.createCipheriv("aes-256-ctr", secretKey, iv);
	const data = cipher.update(buffer);
	const encrypted = Buffer.concat([data, cipher.final()]);
	return encrypted.toString("hex");
}

/**
 * Decrypts a given buffer with the AES.
 * @param buffer - The encrypted data
 * @param secretKey - The secret key used to decrypt the data.
 * @param iv - Initialisation vector.
 * @returns The decrypted data.
 */
function decryptAES(buffer, secretKey, iv) {
	const decipher = crypto.createDecipheriv("aes-256-ctr", secretKey, iv);
	const data = decipher.update(buffer);
	const decrpyted = Buffer.concat([data, decipher.final()]);
	return decrpyted;
}
