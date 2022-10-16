import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { MasterarbeitPhilippRoiner } from "../target/types/masterarbeit_philipp_roiner";
import {
	TOKEN_PROGRAM_ID,
	createAssociatedTokenAccountInstruction,
	getAssociatedTokenAddress,
	createInitializeMintInstruction,
	MINT_SIZE,
	createMint,
	createAssociatedTokenAccount,
	mintTo,
	AccountLayout,
} from "@solana/spl-token";
import { create } from "ipfs-http-client";
import { BN } from "bn.js";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { assert } from "chai";

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

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

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

async function generateKeypair() {
	let keypair = anchor.web3.Keypair.generate();
	await provider.connection.requestAirdrop(
		keypair.publicKey,
		2 * anchor.web3.LAMPORTS_PER_SOL
	);
	await new Promise((resolve) => setTimeout(resolve, 3 * 1000)); // Sleep 3s
	return keypair;
}

const getTokenAmount = async (accountPublicKey, provider) => {
	const tokenInfoLol = await provider.connection.getAccountInfo(
		accountPublicKey
	);
	const data = Buffer.from(tokenInfoLol.data);
	const accountInfo = AccountLayout.decode(data);
	return accountInfo.amount.toString();
};

async function mintNft() {
	// Configure the client to use the local cluster.
	try {
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

// mintNft().then(() => console.log("..."));
// mint_print_edition());

async function makeAndAcceptOffer() {
	// Configure the client to use the local cluster.
	try {
		const program = anchor.workspace
			.MasterarbeitPhilippRoiner as Program<MasterarbeitPhilippRoiner>;

		const wallet = provider.wallet as NodeWallet;
		let offerTaker = anchor.web3.Keypair.generate();

		const cowMint = await createMint(
			program.provider.connection,
			wallet.payer,
			provider.wallet.publicKey,
			provider.wallet.publicKey,
			0
		);

		const pigMint = await createMint(
			program.provider.connection,
			wallet.payer,
			provider.wallet.publicKey,
			provider.wallet.publicKey,
			0
		);

		console.log("Mints created");

		const offerMakerCowTokenAccount = await createAssociatedTokenAccount(
			program.provider.connection,
			wallet.payer,
			cowMint,
			wallet.publicKey
		);

		const offerMakerPigTokenAccount = await createAssociatedTokenAccount(
			program.provider.connection,
			wallet.payer,
			pigMint,
			wallet.publicKey
		);

		const offerTakerCowTokenAccount = await createAssociatedTokenAccount(
			program.provider.connection,
			wallet.payer,
			cowMint,
			offerTaker.publicKey
		);

		const offerTakerPigTokenAccount = await createAssociatedTokenAccount(
			program.provider.connection,
			wallet.payer,
			pigMint,
			offerTaker.publicKey
		);

		console.log("ATAs created");

		await mintTo(
			program.provider.connection,
			wallet.payer,
			cowMint,
			offerMakerCowTokenAccount,
			provider.wallet.publicKey,
			4,
			[]
		);
		await mintTo(
			program.provider.connection,
			wallet.payer,
			pigMint,
			offerTakerPigTokenAccount,
			provider.wallet.publicKey,
			4,
			[]
		);

		console.log("Tokens minted");

		const offer = await anchor.web3.Keypair.generate();
		const [pda, escrowedTokensOfOfferMakerBump] =
			await anchor.web3.PublicKey.findProgramAddress(
				[offer.publicKey.toBuffer()],
				program.programId
			);

		console.log(
			"Token Account offerMaker: ",
			await getTokenAmount(offerMakerCowTokenAccount, provider)
		);

		const tx = await program.methods
			.makeOffer(escrowedTokensOfOfferMakerBump, new BN(2), new BN(4))
			.accounts({
				offer: offer.publicKey,
				whoMadeTheOffer: provider.wallet.publicKey,
				tokenAccountFromWhoMadeTheOffer: offerMakerCowTokenAccount,
				escrowedTokensOfOfferMaker: pda,
				kindOfTokenOffered: cowMint,
				kindOfTokenWantedInReturn: pigMint,
				tokenProgram: TOKEN_PROGRAM_ID,
				systemProgram: anchor.web3.SystemProgram.programId,
				rent: anchor.web3.SYSVAR_RENT_PUBKEY,
			})
			.signers([offer])
			.rpc();
		console.log("Your transaction signature", tx);

		console.log(
			"Token Account offerMaker: ",
			await getTokenAmount(offerMakerCowTokenAccount, provider)
		);
		console.log("PDA: ", await getTokenAmount(pda, provider));

		console.log("ACCEPT OFFER");

		await program.methods
			.acceptOffer()
			.accounts({
				offer: offer.publicKey,
				escrowedTokensOfOfferMaker: pda,
				whoMadeTheOffer: provider.wallet.publicKey,
				whoIsTakingTheOffer: offerTaker.publicKey,
				accountHoldingWhatMakerWillGet: offerMakerPigTokenAccount,
				accountHoldingWhatReceiverWillGive: offerTakerPigTokenAccount,
				accountHoldingWhatReceiverWillGet: offerTakerCowTokenAccount,
				kindOfTokenWantedInReturn: pigMint,
				tokenProgram: TOKEN_PROGRAM_ID,
			})
			.signers([offerTaker])
			.rpc();

		console.log(
			"Cow Token Account offerMaker: ",
			await getTokenAmount(offerMakerCowTokenAccount, provider)
		);
		console.log(
			"Pig Token Account offerMaker: ",
			await getTokenAmount(offerMakerPigTokenAccount, provider)
		);
		console.log(
			"Cow Token Account offerTaker: ",
			await getTokenAmount(offerTakerCowTokenAccount, provider)
		);
		console.log(
			"Pig Token Account offerTaker: ",
			await getTokenAmount(offerTakerPigTokenAccount, provider)
		);
	} catch (e) {
		console.error(e);
	}
}

async function makeAndCancelOffer() {
	// Configure the client to use the local cluster.
	try {
		const program = anchor.workspace
			.MasterarbeitPhilippRoiner as Program<MasterarbeitPhilippRoiner>;

		const wallet = provider.wallet as NodeWallet;
		let offerTaker = anchor.web3.Keypair.generate();

		const cowMint = await createMint(
			program.provider.connection,
			wallet.payer,
			provider.wallet.publicKey,
			provider.wallet.publicKey,
			0
		);

		const pigMint = await createMint(
			program.provider.connection,
			wallet.payer,
			provider.wallet.publicKey,
			provider.wallet.publicKey,
			0
		);

		console.log("Mints created");

		const offerMakerCowTokenAccount = await createAssociatedTokenAccount(
			program.provider.connection,
			wallet.payer,
			cowMint,
			wallet.publicKey
		);

		const offerMakerPigTokenAccount = await createAssociatedTokenAccount(
			program.provider.connection,
			wallet.payer,
			pigMint,
			wallet.publicKey
		);

		const offerTakerCowTokenAccount = await createAssociatedTokenAccount(
			program.provider.connection,
			wallet.payer,
			cowMint,
			offerTaker.publicKey
		);

		const offerTakerPigTokenAccount = await createAssociatedTokenAccount(
			program.provider.connection,
			wallet.payer,
			pigMint,
			offerTaker.publicKey
		);

		console.log("ATAs created");

		await mintTo(
			program.provider.connection,
			wallet.payer,
			cowMint,
			offerMakerCowTokenAccount,
			provider.wallet.publicKey,
			4,
			[]
		);
		await mintTo(
			program.provider.connection,
			wallet.payer,
			pigMint,
			offerTakerPigTokenAccount,
			provider.wallet.publicKey,
			4,
			[]
		);

		console.log("Tokens minted");

		const offer = await anchor.web3.Keypair.generate();
		const [pda, escrowedTokensOfOfferMakerBump] =
			await anchor.web3.PublicKey.findProgramAddress(
				[offer.publicKey.toBuffer()],
				program.programId
			);

		console.log(
			"Token Account offerMaker: ",
			await getTokenAmount(offerMakerCowTokenAccount, provider)
		);

		const tx = await program.methods
			.makeOffer(escrowedTokensOfOfferMakerBump, new BN(2), new BN(4))
			.accounts({
				offer: offer.publicKey,
				whoMadeTheOffer: provider.wallet.publicKey,
				tokenAccountFromWhoMadeTheOffer: offerMakerCowTokenAccount,
				escrowedTokensOfOfferMaker: pda,
				kindOfTokenOffered: cowMint,
				kindOfTokenWantedInReturn: pigMint,
				tokenProgram: TOKEN_PROGRAM_ID,
				systemProgram: anchor.web3.SystemProgram.programId,
				rent: anchor.web3.SYSVAR_RENT_PUBKEY,
			})
			.signers([offer])
			.rpc();
		console.log("Your transaction signature", tx);

		console.log(
			"Token Account offerMaker: ",
			await getTokenAmount(offerMakerCowTokenAccount, provider)
		);
		console.log("PDA: ", await getTokenAmount(pda, provider));

		await program.methods
			.cancelOffer()
			.accounts({
				offer: offer.publicKey,
				whoMadeTheOffer: provider.wallet.publicKey,
				whereTheEscrowedAccountWasFundedFrom: offerMakerCowTokenAccount,
				escrowedTokensOfOfferMaker: pda,
				tokenProgram: TOKEN_PROGRAM_ID,
			})
			// .signers([offerTaker])
			.rpc();

		console.log(
			"Cow Token Account offerMaker: ",
			await getTokenAmount(offerMakerCowTokenAccount, provider)
		);
		console.log(
			"Pig Token Account offerMaker: ",
			await getTokenAmount(offerMakerPigTokenAccount, provider)
		);
		console.log(
			"Cow Token Account offerTaker: ",
			await getTokenAmount(offerTakerCowTokenAccount, provider)
		);
		console.log(
			"Pig Token Account offerTaker: ",
			await getTokenAmount(offerTakerPigTokenAccount, provider)
		);
	} catch (e) {
		console.error(e);
	}
}

// makeAndAcceptOffer();
makeAndCancelOffer();
