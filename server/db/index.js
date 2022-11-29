import sqlite3 from "sqlite3";

const SQLite3 = sqlite3.verbose();
const db = new SQLite3.Database("masterarbeit.db");

export const query = (command, method = "all") => {
	return new Promise((resolve, reject) => {
		db[method](command, (error, result) => {
			if (error) {
				reject(error);
			} else {
				resolve(result);
			}
		});
	});
};

export const initDb = () => {
	db.serialize(async () => {
		await query(
			"CREATE TABLE IF NOT EXISTS keys (ipfs_hash text, aes_key text)",
			"run"
		);
	});
};

export const addEntry = (hash, key) => {
	db.serialize(async () => {
		await query(`INSERT INTO keys VALUES ("${hash}", "${key}")`, "run");
	});
};

export const getEntry = async (hash) => {
	return await query(`SELECT * FROM keys WHERE keys.ipfs_hash = '${hash}'`);
};
