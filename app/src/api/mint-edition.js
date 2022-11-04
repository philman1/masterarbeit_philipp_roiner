import {
	TOKEN_PROGRAM_ID,
	createAssociatedTokenAccountInstruction,
	getAssociatedTokenAddress,
	createInitializeMintInstruction,
	createMintToCheckedInstruction,
	MINT_SIZE,
} from "@solana/spl-token";
import { BN, web3 } from "@project-serum/anchor";
import { useWorkspace } from "@/composables";
import { getMetadata, getMasterEdition } from "./mint-nft";

const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
	"metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export const mintEdition = async (
	masterMintId,
	metadataAddressMaster,
	edition
) => {
	const { connection, wallet, provider, program } = useWorkspace();

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
				wallet.value.publicKey
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
