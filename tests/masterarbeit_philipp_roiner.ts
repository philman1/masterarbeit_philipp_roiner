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
	createMintToCheckedInstruction,
} from "@solana/spl-token";
import { create } from "ipfs-http-client";
import { BN } from "bn.js";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { assert } from "chai";
const { SystemProgram } = anchor.web3;

const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
	"metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

// uses localhost
const ipfs = create();

const nftName = "Lisboa";
const nftSymbol = "Portugal";
let metadataUri = `https://ipfs.infura.io/ipfs/`;

let masterMintId = null;
let ataMaster = null;
let metadataAddressMaster = null;

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
		image: cid,
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

const getNewEdition = async (
	mint: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> => {
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

const getEditionMarkPda = async (): Promise<anchor.web3.PublicKey> => {
	const EDITION_MARKER_BIT_SIZE = 248;
	let edition = 1;

	let editionNumber = new anchor.BN(
		Math.floor(edition / EDITION_MARKER_BIT_SIZE)
	);
	console.log("editionNumber: ", editionNumber.toString());

	return (
		await anchor.web3.PublicKey.findProgramAddress(
			[
				Buffer.from("metadata"),
				TOKEN_METADATA_PROGRAM_ID.toBuffer(),
				masterMintId.publicKey.toBuffer(),
				Buffer.from("edition"),
				Buffer.from(editionNumber.toString()),
			],
			TOKEN_METADATA_PROGRAM_ID
		)
	)[0];
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
		ataMaster = await getAssociatedTokenAddress(
			mintKey.publicKey,
			provider.wallet.publicKey
		);
		console.log("ATA MASTER: ", ataMaster.toBase58());

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
				ataMaster,
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
		metadataAddressMaster = await getMetadata(mintKey.publicKey);
		console.log("Metadata address: ", metadataAddressMaster.toBase58());
		const masterEditionAddress = await getMasterEdition(mintKey.publicKey);
		console.log("MasterEdition address: ", masterEditionAddress.toBase58());

		const image = anchor.web3.Keypair.generate();

		const tx = await program.methods
			.mintNft(
				mintKey.publicKey,
				nftName,
				nftSymbol,
				metadataUri,
				new BN(1)
			)
			.accounts({
				image: image.publicKey,
				mintAuthority: provider.wallet.publicKey,
				mint: mintKey.publicKey,
				tokenAccount: ataMaster,
				tokenProgram: TOKEN_PROGRAM_ID,
				metadata: metadataAddressMaster,
				masterEdition: masterEditionAddress,
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
				payer: provider.wallet.publicKey,
				systemProgram: anchor.web3.SystemProgram.programId,
				rent: anchor.web3.SYSVAR_RENT_PUBKEY,
			})
			.signers([image])
			.rpc();
		console.log("Your transaction signature", tx);
		return tx;
	} catch (e) {
		console.error(e);
	}
}

async function mint_print_edition() {
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
		const newMint: anchor.web3.Keypair = anchor.web3.Keypair.generate();

		// Get the ATA for a token and the account that we want to own the ATA (but it might not existing on the SOL network yet)
		const ata = await getAssociatedTokenAddress(
			newMint.publicKey,
			provider.wallet.publicKey
		);
		console.log("ATA: ", ata.toBase58());

		const tx2 = new anchor.web3.Transaction().add(
			anchor.web3.SystemProgram.createAccount({
				fromPubkey: provider.wallet.publicKey,
				newAccountPubkey: newMint.publicKey,
				lamports,
				space: MINT_SIZE,
				programId: TOKEN_PROGRAM_ID,
			}),
			createInitializeMintInstruction(
				newMint.publicKey,
				0,
				provider.wallet.publicKey,
				null
			),
			createAssociatedTokenAccountInstruction(
				provider.wallet.publicKey,
				ata,
				provider.wallet.publicKey,
				newMint.publicKey
			),
			createMintToCheckedInstruction(
				newMint.publicKey,
				ata,
				provider.wallet.publicKey,
				1,
				0
			)
		);

		// sends and create the transaction
		const res = await program.provider.sendAndConfirm(tx2, [newMint]);

		// metadataUri = await createMetadata();

		console.log("Mint key: ", newMint.publicKey.toString());
		console.log("User: ", provider.wallet.publicKey.toString());

		const newMetadataAddress = await getMetadata(newMint.publicKey);

		const newEditionAddress = await getNewEdition(newMint.publicKey);

		const masterEditionAddress = await getMasterEdition(
			masterMintId.publicKey
		);

		const editionMarkPda = await getEditionMarkPda();

		console.log("newMetadataAddress: ", newMetadataAddress.toBase58());
		console.log(
			"MetadataAddressmaster: ",
			metadataAddressMaster.toBase58()
		);
		console.log("newEditionAddress: ", newEditionAddress.toBase58());
		console.log("masterEditionAddress: ", masterEditionAddress.toBase58());
		console.log("editionMarkPda: ", editionMarkPda.toBase58());

		console.log(
			JSON.stringify({
				originalMint: masterMintId.publicKey,
				newMetadata: newMetadataAddress,
				newEdition: newEditionAddress,
				masterEdition: masterEditionAddress,
				newMint: newMint.publicKey,
				newTokenAccount: ata,
				editionMarkPda: editionMarkPda,
				newMintAuthority: provider.wallet.publicKey,
				payer: provider.wallet.publicKey,
				tokenAccountOwner: provider.wallet.publicKey,
				tokenAccount: ataMaster,
				newMetadataUpdateAuthority: provider.wallet.publicKey,
				metadata: metadataAddressMaster,
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
				tokenProgram: TOKEN_PROGRAM_ID,
				systemProgram: anchor.web3.SystemProgram.programId,
				rent: anchor.web3.SYSVAR_RENT_PUBKEY,
			})
		);

		const tx = await program.methods
			.mintEdition(new anchor.BN(1))
			.accounts({
				originalMint: masterMintId.publicKey,
				newMetadata: newMetadataAddress,
				newEdition: newEditionAddress,
				masterEdition: masterEditionAddress,
				newMint: newMint.publicKey,
				newTokenAccount: ata,
				editionMarkPda: editionMarkPda,
				newMintAuthority: provider.wallet.publicKey,
				payer: provider.wallet.publicKey,
				tokenAccountOwner: provider.wallet.publicKey,
				tokenAccount: ataMaster,
				newMetadataUpdateAuthority: provider.wallet.publicKey,
				metadata: metadataAddressMaster,
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
				tokenProgram: TOKEN_PROGRAM_ID,
				systemProgram: anchor.web3.SystemProgram.programId,
				rent: anchor.web3.SYSVAR_RENT_PUBKEY,
			})
			.rpc();
		console.log("Your transaction signature", tx);
	} catch (e) {
		console.error(e);
	}
}

// mintNft().then(() => mint_print_edition());

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
// makeAndCancelOffer();

async function closeAccounts() {
	try {
		const program = anchor.workspace
			.MasterarbeitPhilippRoiner as Program<MasterarbeitPhilippRoiner>;

		const images = await program.account.image.all();
		console.log(images.length);
		const del = images[0];

		const tx = await program.methods
			.closeAccount()
			.accounts({
				account: del.publicKey,
				author: provider.wallet.publicKey,
			})
			.rpc();

		const i = await program.account.image.fetchNullable(del.publicKey);
		console.log(i);
		const images2 = await program.account.image.all();
		console.log(images2.length);
	} catch (e) {
		console.log(e);
	}
}

closeAccounts();
