import {
	TOKEN_PROGRAM_ID,
	createAssociatedTokenAccountInstruction,
	getAssociatedTokenAddress,
	createInitializeMintInstruction,
	createMintToCheckedInstruction,
	MINT_SIZE,
} from "@solana/spl-token";
import { BN, web3 } from "@project-serum/anchor";
import { create } from "ipfs-http-client";
import { useWorkspace } from "@/composables";

const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
	"metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

// uses localhost
const ipfs = create();

let metadataUri = null;
// let masterMintId = null;
let ata = null;

export const saveToIpfs = async (files) => {
	const source = ipfs.addAll([...files], {
		progress: (prog) => console.log(`received: ${prog}`),
	});
	try {
		let cids = [];
		for await (const file of source) {
			console.log(file);
			cids.push(file.path);
		}
		return cids;
	} catch (err) {
		console.error(err);
	}
};

export const mintNft = async (metadata) => {
	const { connection, wallet, provider, program } = useWorkspace();

	// Configure the client to use the local cluster.
	try {
		const lamports = await connection.getMinimumBalanceForRentExemption(
			MINT_SIZE
		);

		// Generate a random keypair that will represent our token
		const mintKey = web3.Keypair.generate();
		// masterMintId = mintKey;
		console.log(wallet.value.publicKey);
		// Get the ATA for a token and the account that we want to own the ATA (but it might not existing on the SOL network yet)
		ata = await getAssociatedTokenAddress(
			mintKey.publicKey,
			wallet.value.publicKey
		);
		console.log("NFT Account: ", ata.toBase58());

		// Fires a list of instructions
		const mint_tx = new web3.Transaction().add(
			// Use anchor to create an account from the mint wallet.value.publicKey that we created
			web3.SystemProgram.createAccount({
				fromPubkey: wallet.value.publicKey,
				newAccountPubkey: mintKey.publicKey,
				space: MINT_SIZE,
				programId: TOKEN_PROGRAM_ID,
				lamports,
			}),
			// Fire a transaction to create our mint account that is controlled by our anchor wallet.value
			createInitializeMintInstruction(
				mintKey.publicKey,
				0,
				wallet.value.publicKey,
				wallet.value.publicKey
			),
			// Create the ATA account that is associated with our mint on our anchor wallet.value
			createAssociatedTokenAccountInstruction(
				wallet.value.publicKey,
				ata,
				wallet.value.publicKey,
				mintKey.publicKey
			)
		);

		// sends and create the transaction
		await provider.value.sendAndConfirm(mint_tx, [mintKey]);

		metadataUri = await uploadOffchainMetadataToIpfs(metadata);

		console.log("Mint key: ", mintKey.publicKey.toString());
		console.log("User: ", wallet.value.publicKey.toString());

		// Executes our code to mint our token into our specified ATA
		const metadataAddress = await getMetadata(mintKey.publicKey);
		console.log("Metadata address: ", metadataAddress.toBase58());
		const masterEditionAddress = await getMasterEdition(mintKey.publicKey);
		console.log("MasterEdition address: ", masterEditionAddress.toBase58());

		const image = web3.Keypair.generate();

		const tx = await program.value.methods
			.mintNft(
				mintKey.publicKey,
				metadata.name,
				metadata.symbol,
				metadataUri,
				new BN(1)
			)
			.accounts({
				image: image.publicKey,
				mintAuthority: wallet.value.publicKey,
				mint: mintKey.publicKey,
				tokenAccount: ata,
				tokenProgram: TOKEN_PROGRAM_ID,
				metadata: metadataAddress,
				masterEdition: masterEditionAddress,
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
				payer: wallet.value.publicKey,
				systemProgram: web3.SystemProgram.programId,
				rent: web3.SYSVAR_RENT_PUBKEY,
			})
			.signers([image])
			.rpc();
		console.log("Your transaction signature", tx);
		return tx;
	} catch (e) {
		console.error(e);
	}
};

export const mintEdition = async (
	masterMintId,
	metadataAddressMaster,
	edition
) => {
	const { connection, wallet, provider, program } = useWorkspace();
	console.log(masterMintId, metadataAddressMaster, edition);
	try {
		const lamports = await connection.getMinimumBalanceForRentExemption(
			MINT_SIZE
		);

		const ataMaster = await getAssociatedTokenAddress(
			masterMintId,
			wallet.value.publicKey
		);

		console.log("ATA Master: ", ataMaster);

		// Generate a random keypair that will represent our token
		const newMint = web3.Keypair.generate();

		// Get the ATA for a token and the account that we want to own the ATA (but it might not existing on the SOL network yet)
		const ata = await getAssociatedTokenAddress(
			newMint.publicKey,
			wallet.value.publicKey
		);
		console.log("ATA: ", ata.toBase58());

		const tx2 = new web3.Transaction().add(
			web3.SystemProgram.createAccount({
				fromPubkey: wallet.value.publicKey,
				newAccountPubkey: newMint.publicKey,
				lamports,
				space: MINT_SIZE,
				programId: TOKEN_PROGRAM_ID,
			}),
			createInitializeMintInstruction(
				newMint.publicKey,
				0,
				wallet.value.publicKey,
				null
			),
			createAssociatedTokenAccountInstruction(
				wallet.value.publicKey,
				ata,
				wallet.value.publicKey,
				newMint.publicKey
			),
			createMintToCheckedInstruction(
				newMint.publicKey,
				ata,
				wallet.value.publicKey,
				1,
				0
			)
		);

		// sends and create the transaction
		await provider.value.sendAndConfirm(tx2, [newMint]);

		// metadataUri = await createMetadata();

		console.log("Mint key: ", newMint.publicKey.toString());
		console.log("User: ", wallet.value.publicKey.toString());

		const newMetadataAddress = await getMetadata(newMint.publicKey);

		const newEditionAddress = await getNewEdition(newMint.publicKey);

		const masterEditionAddress = await getMasterEdition(masterMintId);

		const editionMarkPda = await getEditionMarkPda(masterMintId, edition);

		console.log("newMetadataAddress: ", newMetadataAddress.toBase58());
		console.log(
			"MetadataAddressmaster: ",
			metadataAddressMaster.toBase58()
		);
		console.log("newEditionAddress: ", newEditionAddress.toBase58());
		console.log("masterEditionAddress: ", masterEditionAddress.toBase58());
		console.log("editionMarkPda: ", editionMarkPda.toBase58());

		const tx = await program.value.methods
			.mintEdition(new BN(edition))
			.accounts({
				originalMint: masterMintId,
				newMetadata: newMetadataAddress,
				newEdition: newEditionAddress,
				masterEdition: masterEditionAddress,
				newMint: newMint.publicKey,
				newTokenAccount: ata,
				editionMarkPda: editionMarkPda,
				newMintAuthority: wallet.value.publicKey,
				payer: wallet.value.publicKey,
				tokenAccountOwner: wallet.value.publicKey,
				tokenAccount: ataMaster,
				newMetadataUpdateAuthority: wallet.value.publicKey,
				metadata: metadataAddressMaster,
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
				tokenProgram: TOKEN_PROGRAM_ID,
				systemProgram: web3.SystemProgram.programId,
				rent: web3.SYSVAR_RENT_PUBKEY,
			})
			.rpc();
		console.log("Your transaction signature", tx);
	} catch (e) {
		console.error(e);
	}
};

const uploadOffchainMetadataToIpfs = async (metadata) => {
	const ipfs_metadata = await ipfs.add(JSON.stringify(metadata));
	if (ipfs_metadata == null) {
		return "";
	} else {
		return `https://ipfs.io/ipfs/${ipfs_metadata.path}`;
	}
};

const getMetadata = async (mint) => {
	return (
		await web3.PublicKey.findProgramAddress(
			[
				Buffer.from("metadata"),
				TOKEN_METADATA_PROGRAM_ID.toBuffer(),
				mint.toBuffer(),
			],
			TOKEN_METADATA_PROGRAM_ID
		)
	)[0];
};

const getMasterEdition = async (mint) => {
	return (
		await web3.PublicKey.findProgramAddress(
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

const getNewEdition = async (mint) => {
	return (
		await web3.PublicKey.findProgramAddress(
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

const getEditionMarkPda = async (masterMintId, edition) => {
	const EDITION_MARKER_BIT_SIZE = 248;

	let editionNumber = new BN(Math.floor(edition / EDITION_MARKER_BIT_SIZE));
	console.log("editionNumber: ", editionNumber.toString());

	return (
		await web3.PublicKey.findProgramAddress(
			[
				Buffer.from("metadata"),
				TOKEN_METADATA_PROGRAM_ID.toBuffer(),
				masterMintId.toBuffer(),
				Buffer.from("edition"),
				Buffer.from(editionNumber.toString()),
			],
			TOKEN_METADATA_PROGRAM_ID
		)
	)[0];
};
