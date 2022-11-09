import {
	TOKEN_PROGRAM_ID,
	createAssociatedTokenAccountInstruction,
	getAssociatedTokenAddress,
	createInitializeMintInstruction,
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
		const ata = await getAssociatedTokenAddress(
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

		const metadataUri = await uploadOffchainMetadataToIpfs(metadata);

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
				wallet.value.publicKey,
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

const uploadOffchainMetadataToIpfs = async (metadata) => {
	const ipfs_metadata = await ipfs.add(JSON.stringify(metadata));
	if (ipfs_metadata == null) {
		return "";
	} else {
		return `https://ipfs.io/ipfs/${ipfs_metadata.path}`;
	}
};

export const getMetadata = async (mint) => {
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

export const getMasterEdition = async (mint) => {
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
