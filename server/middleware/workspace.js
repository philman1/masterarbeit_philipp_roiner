import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { Program, AnchorProvider, Wallet } from "@project-serum/anchor";
import idl from "../idl.json" assert { type: "json" };

const clusterUrl = "https://api.devnet.solana.com";
const preflightCommitment = "processed";
const commitment = "processed";
const programID = new PublicKey(idl.metadata.address);

let workspace = null;

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

export const fetchLicenses = async (owner, mint) => {
	const { program } = workspace;
	return await program.account.license.all([
		licenseOwnerFilter(owner),
		licenseMintFilter(mint),
	]);
};

const licenseOwnerFilter = (ownerBase58PublicKey) => ({
	memcmp: {
		offset:
			8 + // Discriminator
			1, // License type
		bytes: ownerBase58PublicKey,
	},
});

const licenseMintFilter = (mintBase58PublicKey) => ({
	memcmp: {
		offset:
			8 + // Discriminator
			1 + // License type
			32, // Owner
		bytes: mintBase58PublicKey,
	},
});

export const fetchImageAccount = async (mint) => {
	const { program } = workspace;
	return await program.account.image.all([imageMintFilter(mint)]);
};

const imageMintFilter = (mintBase58PublicKey) => ({
	memcmp: {
		offset:
			8 + // Discriminator
			32 + // Author
			8, // Timestamp
		bytes: mintBase58PublicKey,
	},
});
