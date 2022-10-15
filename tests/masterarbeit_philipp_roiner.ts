import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { MasterarbeitPhilippRoiner } from "../target/types/masterarbeit_philipp_roiner";
import {
	TOKEN_PROGRAM_ID,
	createAssociatedTokenAccountInstruction,
	getAssociatedTokenAddress,
	createInitializeMintInstruction,
	createMintToCheckedInstruction,
	MINT_SIZE,
} from "@solana/spl-token";
import { create } from "ipfs-http-client";

const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
	"metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

// uses localhost
const ipfs = create();

const nftName = "Lisboa";
const nftSymbol = "Portugal";
let metadataUri = `https://ipfs.infura.io/ipfs/`;

let masterMintId = null;
let nftTokenAccount = null;

const createMetadata = async () => {
	// Upload image to IPFS
	// ipfs.add()
	const cid = "QmTYCv2eFMWkCnd5MZTZJkYpD7Q7v2JkRCgW7GrRXgASC9";
	const image_url = `ipfs://${cid}`;

	const metadata = {
		name: "Lisboa",
		symbol: "Portugal",
		description: "This is a image I took in Lisboa",
		image: image_url,
	};

	const ipfs_metadata = await ipfs.add(JSON.stringify(metadata));
	if (ipfs_metadata == null) {
		return "";
	} else {
		return `ipfs://${ipfs_metadata.path}`;
	}
};

const getMetadata = async (
	mint: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> => {
	return (
		await anchor.web3.PublicKey.findProgramAddress(
			[
				Buffer.from("metadata"),
				TOKEN_METADATA_PROGRAM_ID.toBuffer(),
				mint.toBuffer(),
			],
			TOKEN_METADATA_PROGRAM_ID
		)
	)[0];
};

const getMasterEdition = async (mint: anchor.web3.PublicKey) => {
	return (
		await anchor.web3.PublicKey.findProgramAddress(
			[
				Buffer.from("metadata"),
				TOKEN_METADATA_PROGRAM_ID.toBuffer(),
				mint.toBuffer(),
				Buffer.from("edition"),
			],
			TOKEN_METADATA_PROGRAM_ID
		)
	)[0];
};

async function sol_mint_nft() {
	// Configure the client to use the local cluster.
	try {
		const provider = anchor.AnchorProvider.env();
		anchor.setProvider(provider);

		const program = anchor.workspace
			.MasterarbeitPhilippRoiner as Program<MasterarbeitPhilippRoiner>;

		console.log("Program Id: ", program.programId.toBase58());
		console.log("Mint Size: ", MINT_SIZE);
		const lamports =
			await program.provider.connection.getMinimumBalanceForRentExemption(
				MINT_SIZE
			);
		console.log("Mint Account Lamports: ", lamports);

		// Generate a random keypair that will represent our token
		const mintKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();
		masterMintId = mintKey;

		// Get the ATA for a token and the account that we want to own the ATA (but it might not existing on the SOL network yet)
		nftTokenAccount = await getAssociatedTokenAddress(
			mintKey.publicKey,
			provider.wallet.publicKey
		);
		console.log("NFT Account: ", nftTokenAccount.toBase58());

		// Fires a list of instructions
		const mint_tx = new anchor.web3.Transaction().add(
			// Use anchor to create an account from the mint provider.wallet.publicKey that we created
			anchor.web3.SystemProgram.createAccount({
				fromPubkey: provider.wallet.publicKey,
				newAccountPubkey: mintKey.publicKey,
				space: MINT_SIZE,
				programId: TOKEN_PROGRAM_ID,
				lamports,
			}),
			// Fire a transaction to create our mint account that is controlled by our anchor wallet
			createInitializeMintInstruction(
				mintKey.publicKey,
				0,
				provider.wallet.publicKey,
				provider.wallet.publicKey
			),
			// Create the ATA account that is associated with our mint on our anchor wallet
			createAssociatedTokenAccountInstruction(
				provider.wallet.publicKey,
				nftTokenAccount,
				provider.wallet.publicKey,
				mintKey.publicKey
			)
		);

		// sends and create the transaction
		const res = await program.provider.sendAndConfirm(mint_tx, [mintKey]);

		metadataUri = await createMetadata();

		console.log("Mint key: ", mintKey.publicKey.toString());
		console.log("User: ", provider.wallet.publicKey.toString());

		// Executes our code to mint our token into our specified ATA
		const metadataAddress = await getMetadata(mintKey.publicKey);
		console.log("Metadata address: ", metadataAddress.toBase58());
		const masterEditionAddress = await getMasterEdition(mintKey.publicKey);
		console.log("MasterEdition address: ", masterEditionAddress.toBase58());

		const tx = await program.methods
			.mintNft(mintKey.publicKey, nftName, nftSymbol, metadataUri)
			.accounts({
				mintAuthority: provider.wallet.publicKey,
				mint: mintKey.publicKey,
				tokenAccount: nftTokenAccount,
				tokenProgram: TOKEN_PROGRAM_ID,
				metadata: metadataAddress,
				masterEdition: masterEditionAddress,
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
				payer: provider.wallet.publicKey,
				systemProgram: anchor.web3.SystemProgram.programId,
				rent: anchor.web3.SYSVAR_RENT_PUBKEY,
			})
			.rpc();
		console.log("Your transaction signature", tx);
		return tx;
	} catch (e) {
		console.error(e);
	}
}

// async function mint_print_edition() {
// 	const getNewEdition = async (
// 		mint: anchor.web3.PublicKey
// 	): Promise<anchor.web3.PublicKey> => {
// 		return (
// 			await anchor.web3.PublicKey.findProgramAddress(
// 				[
// 					Buffer.from("metadata"),
// 					TOKEN_METADATA_PROGRAM_ID.toBuffer(),
// 					mint.toBuffer(),
// 					Buffer.from("metadata"),
// 				],
// 				TOKEN_METADATA_PROGRAM_ID
// 			)
// 		)[0];
// 	};

// 	const getMasterEdition = async (
// 		mint: anchor.web3.PublicKey
// 	): Promise<anchor.web3.PublicKey> => {
// 		return (
// 			await anchor.web3.PublicKey.findProgramAddress(
// 				[
// 					Buffer.from("metadata"),
// 					TOKEN_METADATA_PROGRAM_ID.toBuffer(),
// 					masterMintId.publicKey.toBuffer(),
// 					Buffer.from("edition"),
// 				],
// 				TOKEN_METADATA_PROGRAM_ID
// 			)
// 		)[0];
// 	};

// 	const getEditionMarkPda = async (
// 		mint: anchor.web3.PublicKey
// 	): Promise<anchor.web3.PublicKey> => {
// 		return (
// 			await anchor.web3.PublicKey.findProgramAddress(
// 				[
// 					Buffer.from("metadata"),
// 					TOKEN_METADATA_PROGRAM_ID.toBuffer(),
// 					masterMintId.publicKey.toBuffer(),
// 					Buffer.from("edition"),
// 					Buffer.from("1"),
// 				],
// 				TOKEN_METADATA_PROGRAM_ID
// 			)
// 		)[0];
// 	};

// 	// Configure the client to use the local cluster.
// 	try {
// 		const provider = anchor.AnchorProvider.env();
// 		anchor.setProvider(provider);

// 		const program = anchor.workspace
// 			.MasterarbeitPhilippRoiner as Program<MasterarbeitPhilippRoiner>;

// 		console.log("Program Id: ", program.programId.toBase58());
// 		console.log("Mint Size: ", MINT_SIZE);
// 		const lamports =
// 			await program.provider.connection.getMinimumBalanceForRentExemption(
// 				MINT_SIZE
// 			);
// 		console.log("Mint Account Lamports: ", lamports);

// 		// Generate a random keypair that will represent our token
// 		const newMint: anchor.web3.Keypair = anchor.web3.Keypair.generate();

// 		// Get the ATA for a token and the account that we want to own the ATA (but it might not existing on the SOL network yet)
// 		const nftTokenAccount = await getAssociatedTokenAddress(
// 			newMint.publicKey,
// 			provider.wallet.publicKey
// 		);
// 		console.log("NFT Account: ", nftTokenAccount.toBase58());

// 		// Fires a list of instructions
// 		// const mint_tx = new anchor.web3.Transaction().add(
// 		// 	// Use anchor to create an account from the mint provider.wallet.publicKey that we created
// 		// 	anchor.web3.SystemProgram.createAccount({
// 		// 		fromPubkey: provider.wallet.publicKey,
// 		// 		newAccountPubkey: mintKey.publicKey,
// 		// 		space: MINT_SIZE,
// 		// 		programId: TOKEN_PROGRAM_ID,
// 		// 		lamports,
// 		// 	}),
// 		// 	// Fire a transaction to create our mint account that is controlled by our anchor wallet
// 		// 	createInitializeMintInstruction(
// 		// 		mintKey.publicKey,
// 		// 		0,
// 		// 		provider.wallet.publicKey,
// 		// 		provider.wallet.publicKey
// 		// 	),
// 		// 	// Create the ATA account that is associated with our mint on our anchor wallet
// 		// 	createAssociatedTokenAccountInstruction(
// 		// 		provider.wallet.publicKey,
// 		// 		nftTokenAccount,
// 		// 		provider.wallet.publicKey,
// 		// 		mintKey.publicKey
// 		// 	)
// 		// );
// 		const tx2 = new anchor.web3.Transaction().add(
// 			anchor.web3.SystemProgram.createAccount({
// 				fromPubkey: provider.wallet.publicKey,
// 				newAccountPubkey: newMint.publicKey,
// 				lamports,
// 				space: MINT_SIZE,
// 				programId: TOKEN_PROGRAM_ID,
// 			}),
// 			createInitializeMintInstruction(
// 				newMint.publicKey,
// 				0,
// 				provider.wallet.publicKey,
// 				null
// 			),
// 			createAssociatedTokenAccountInstruction(
// 				provider.wallet.publicKey,
// 				nftTokenAccount,
// 				provider.wallet.publicKey,
// 				newMint.publicKey
// 			),
// 			createMintToCheckedInstruction(
// 				newMint.publicKey,
// 				nftTokenAccount,
// 				provider.wallet.publicKey,
// 				1,
// 				0
// 			)
// 		);

// 		// const mintResult = await connection.sendTransaction(tx, [wallet.payer, newMint]
// 		// sends and create the transaction
// 		const res = await program.provider.sendAndConfirm(tx2, [newMint]);

// 		metadataUri = await createMetadata();

// 		console.log("Mint key: ", newMint.publicKey.toString());
// 		console.log("User: ", provider.wallet.publicKey.toString());

// 		// Executes our code to mint our token into our specified ATA
// 		const metadataAddress = await getMetadata(newMint.publicKey);

// 		const newEditionAddress = await getNewEdition(newMint.publicKey);

// 		const masterEditionAddress = await getMasterEdition(newMint.publicKey);

// 		const editionMarkPda = await getEditionMarkPda(newMint.publicKey);

// 		const tx = await program.methods
// 			.mintPrintEdition()
// 			.accounts({
// 				newMetadata: metadataAddress,
// 				newEdition: newEditionAddress,
// 				masterEdition: masterEditionAddress,
// 				newMint: newMint.publicKey,
// 				editionMarkPda: editionMarkPda,
// 				newMintAuthority: provider.wallet.publicKey,
// 				payer: provider.wallet.publicKey,
// 				tokenAccountOwner: provider.wallet.publicKey,
// 				tokenAccount: nftTokenAccount,
// 				newMetadataUpdateAuthority: provider.wallet.publicKey,
// 				metadata: metadataAddress,
// 				tokenProgram: TOKEN_PROGRAM_ID,
// 				systemProgram: anchor.web3.SystemProgram.programId,
// 				rent: anchor.web3.SYSVAR_RENT_PUBKEY,
// 			})
// 			.rpc();
// 		console.log("Your transaction signature", tx);
// 	} catch (e) {
// 		console.error(e);
// 	}
// }

sol_mint_nft().then(() => console.log("..."));
// mint_print_edition());
