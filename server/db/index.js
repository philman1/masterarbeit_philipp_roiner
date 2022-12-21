import sqlite3 from "sqlite3";

const SQLite3 = sqlite3.verbose();
const db = new SQLite3.Database("masterarbeit.db");

/**
 * Executes a given command on the database.
 * @param command - The SQL command.
 * @param [method=all] - The method to use.
 * @returns A promise.
 */
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

/**
 * It creates a table called keys.
 *
 * The table has two columns: ipfs_hash and aes_key.
 *
 * The ipfs_hash column is a string that will hold the IPFS hash of the encrypted file.
 * The aes_key column is a string that will hold the AES key used to encrypt and decrypt the file.
 */
export const initDb = () => {
	db.serialize(async () => {
		await query(
			"CREATE TABLE IF NOT EXISTS keys (ipfs_hash text, aes_key text)",
			"run"
		);
	});
};

/**
 * Adds a new entry to the database.
 * @param hash - The hash of the file
 * @param key - The key of the AES
 */
export const addEntry = (hash, key) => {
	db.serialize(async () => {
		await query(`INSERT INTO keys VALUES ("${hash}", "${key}")`, "run");
	});
};

/**
 * Gets an entry of the database.
 * @param hash - the hash of the entry you want to retrieve
 * @returns The result of the query.
 */
export const getEntry = async (hash) => {
	return await query(`SELECT * FROM keys WHERE keys.ipfs_hash = '${hash}'`);
};
