import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { Program, AnchorProvider, Wallet } from "@project-serum/anchor";
import idl from "../idl.json" assert { type: "json" };

const clusterUrl = "https://api.devnet.solana.com";
const preflightCommitment = "processed";
const commitment = "processed";
const programID = new PublicKey(idl.metadata.address);

let workspace = null;

/**
 * Creates a new wallet, connects to the cluster, creates a new provider, and creates a new program that can be accessed from the server
 */
export const initWorkspace = () => {
	const keypair = Keypair.generate();
	const wallet = new Wallet(keypair);
	const connection = new Connection(clusterUrl, commitment);
	const provider = new AnchorProvider(connection, wallet, {
		preflightCommitment,
		commitment,
	});
	const program = new Program(idl, programID, provider);

	workspace = {
		wallet,
		connection,
		provider,
		program,
	};

	console.log("Workspace initialized");
};

/**
 * It fetches all licenses owned by a given account and minted by a given mint
 * @param owner - The address of the license owner.
 * @param mint - The mint that the license is for.
 * @returns An array of license accounts.
 */
export const fetchLicenses = async (owner, mint) => {
	const { program } = workspace;
	return await program.account.license.all([
		licenseOwnerFilter(owner),
		licenseMintFilter(mint),
	]);
};

/**
 * Returns a filter that will match a license whose owner is the given public key
 * @param ownerBase58PublicKey - The public key of the license owner.
 */
const licenseOwnerFilter = (ownerBase58PublicKey) => ({
	memcmp: {
		offset:
			8 + // Discriminator
			1, // License type
		bytes: ownerBase58PublicKey,
	},
});

/**
 *Returns a filter that will match a license whose mint is the given public key
 * @param mintBase58PublicKey - The public key of the mint.
 */
const licenseMintFilter = (mintBase58PublicKey) => ({
	memcmp: {
		offset:
			8 + // Discriminator
			1 + // License type
			32, // Owner
		bytes: mintBase58PublicKey,
	},
});

/**
 * It fetches a image account whose mint is the given public key
 * @param mint - The public key of the mint.
 * @returns An array of image accounts.
 */
export const fetchImageAccount = async (mint) => {
	const { program } = workspace;
	return await program.account.image.all([imageMintFilter(mint)]);
};

/**
 * Returns a filter that will match a image account whose mint is the given public key
 * @param mintBase58PublicKey - The public key of the mint.
 */
const imageMintFilter = (mintBase58PublicKey) => ({
	memcmp: {
		offset:
			8 + // Discriminator
			32 + // Author
			8, // Timestamp
		bytes: mintBase58PublicKey,
	},
});
