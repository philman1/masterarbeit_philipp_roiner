import fs from "fs";
import path from "path";
import crypto from "crypto";
import ipfsClient from "ipfs-http-client";
const ipfsEndPoint = "http://127.0.0.1:5001";
const ipfs = ipfsClient(ipfsEndPoint);

export async function encryptFiles(files) {
	try {
		let encryptedFiles = [];

		//listing all files using forEach
		files.map(async ({ name, buff }) => {
			const key = crypto.randomBytes(16).toString("hex"); // 16 bytes -> 32 chars
			const iv = crypto.randomBytes(8).toString("hex"); // 8 bytes -> 16 chars
			const ekey = encryptRSA(key); // 32 chars -> 684 chars
			const ebuff = encryptAES(buff, key, iv);

			encryptedFiles.push({
				name: name,
				buff: Buffer.concat([
					// headers: encrypted key and IV (len: 700=684+16)
					Buffer.from(ekey, "utf8"), // char length: 684
					Buffer.from(iv, "utf8"), // char length: 16
					Buffer.from(ebuff, "utf8"),
				]),
			});
		});

		return encryptedFiles;

		// console.log("ENCRYPTION --------");
		// console.log("key:", key, "iv:", iv, "ekey:", ekey.length);
		// console.log("contents:", buff.length, "encrypted:", ebuff.length);
		// console.log(" ");
	} catch (err) {
		console.log(err);
		throw err;
	}
}

async function toArray(asyncIterator) {
	const arr = [];
	for await (const i of asyncIterator) {
		arr.push(i);
	}
	return arr;
}

export async function downloadFileDecrypted(cid) {
	try {
		console.log(cid);
		// let file_data = await ipfs.files.read(ipfspath);
		const chunks = [];
		for await (const chunk of ipfs.cat(cid)) {
			chunks.push(chunk);
		}

		const edata = Buffer.concat(chunks);
		console.log(edata);
		const key = decryptRSA(edata.slice(0, 684).toString("utf8"));
		const iv = edata.slice(684, 700).toString("utf8");
		const econtent = edata.slice(700).toString("utf8");
		const ebuf = Buffer.from(econtent, "hex");
		const content = decryptAES(ebuf, key, iv);

		console.log(" ");
		console.log("DECRYPTION --------");
		console.log("key:", key, "iv:", iv);
		console.log("contents:", content.length, "encrypted:", econtent.length);
		console.log("downloaded:", edata.length);

		return content;
	} catch (err) {
		console.log(err);
		throw err;
	}
}

async function getUploadedFiles(ipfspath = "/encrypted/") {
	let files = [];
	const arr = await toArray(ipfs.files.ls(ipfspath));
	for (let file of arr) {
		if (file.type === "directory") {
			const inner = await getUploadedFiles(ipfspath + file.name + "/");
			files = files.concat(inner);
		} else {
			files.push({
				path: ipfspath + file.name,
				size: file.size,
				cid: file.cid.toString(),
			});
		}
	}
	return files;
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

function generateKeys() {
	if (fs.existsSync("private.pem") && fs.existsSync("public.pem")) return;

	const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
		modulusLength: 4096,
		publicKeyEncoding: {
			type: "pkcs1",
			format: "pem",
		},
		privateKeyEncoding: {
			type: "pkcs1",
			format: "pem",
			cipher: "aes-256-cbc",
			passphrase: "",
		},
	});

	fs.writeFileSync("private.pem", privateKey);
	fs.writeFileSync("public.pem", publicKey);
}

function encryptRSA(toEncrypt, pubkeyPath = "public.pem") {
	const absolutePath = path.resolve(pubkeyPath);
	const publicKey = fs.readFileSync(absolutePath, "utf8");
	const buffer = Buffer.from(toEncrypt, "utf8");
	const encrypted = crypto.publicEncrypt(publicKey, buffer);
	return encrypted.toString("base64");
}

function decryptRSA(toDecrypt, privkeyPath = "private.pem") {
	const absolutePath = path.resolve(privkeyPath);
	const privateKey = fs.readFileSync(absolutePath, "utf8");
	const buffer = Buffer.from(toDecrypt, "base64");
	const decrypted = crypto.privateDecrypt(
		{
			key: privateKey.toString(),
			passphrase: "",
		},
		buffer
	);
	return decrypted.toString("utf8");
}
