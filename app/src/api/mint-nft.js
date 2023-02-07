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
import { req } from "@/api";
import { useWallet } from "solana-wallets-vue";

const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
	"metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

// uses localhost
const ipfs = create();

/**
 * Uploads the given files to the IPFS
 * @param files - Files to upload
 * @returns Response.
 */
export const saveToIpfs = async (files) => {
	const { publicKey, signMessage } = useWallet();
	const formData = new FormData();

	for (var i = 0; i < files.length; i++) {
		formData.append("data", files[i]);
	}

	const res = await req(
		{
			method: "POST",
			url: "http://localhost:3000/multiple-upload",
			data: formData,
		},
		"upload:images",
		{ publicKey: publicKey.value, signMessage: signMessage.value }
	);
	return await res.json();
};

/**
 * Creates a new NFT for a given image.
 * @param metadata - Metadata that describes the NFT.
 * @param licenseInformation - Informations about licensing.
 */
export const mintNft = async (metadata, licenseInformation) => {
	const { connection, wallet, provider, program } = useWorkspace();
	const { available, allowedLicenseTypes, oneTimePrice } = licenseInformation;

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

		const image = await getImageAddress(
			program,
			mintKey.publicKey,
			wallet.value.publicKey
		);

		console.log(allowedLicenseTypes, oneTimePrice);

		const tx = await program.value.methods
			.mintNft(
				wallet.value.publicKey,
				metadata.name,
				metadata.symbol,
				metadataUri,
				available,
				new BN(allowedLicenseTypes),
				new BN(Number(oneTimePrice) * web3.LAMPORTS_PER_SOL)
			)
			.accounts({
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
				image: image,
			})
			.rpc();
		console.log("Your transaction signature", tx);
		return tx;
	} catch (e) {
		console.error(e);
	}
};

/**
 * Uploads a JSON Object (Off-Chain metadata) to the IPFS
 * @param metadata - The metadata object that should be uploaded to the IPFS.
 * @returns The a link to the IPFS.
 */
const uploadOffchainMetadataToIpfs = async (metadata) => {
	const ipfs_metadata = await ipfs.add(JSON.stringify(metadata));
	if (ipfs_metadata == null) {
		return "";
	} else {
		return `http://127.0.0.1:8080/ipfs/${ipfs_metadata.path}`;
	}
};

/**
 * Returns the Program Derived Address for the given seeds that will be used to create or find a metadata account.
 * @param mint - The mint address of the token.
 * @returns The public key for the PDA.
 */
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

/**
 * Returns the Program Derived Address for the given seeds that will be used to create or find a master edition account.
 * @param mint - The mint address of the token
 * @returns The public key for the PDA.
 */
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

/**
 * Returns the Program Derived Address for the given seeds that will be used to create or find a image account.
 * @param mint - The mint address of the token
 * @param author - The public key of the account that owns the image.
 * @param programId - The program ID of the program.
 * @returns The public key for the PDA.
 */
export const getImageAddress = async (program, mint, author) => {
	return (
		await web3.PublicKey.findProgramAddress(
			[mint.toBuffer(), Buffer.from("image"), author.toBuffer()],
			program.value.programId
		)
	)[0];
};
