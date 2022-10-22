const dodo = async () => {
	//generate a new mint account and a new associated token account
	const new_mintKey = anchor.web3.Keypair.generate();

	const lamports: number =
		await program.provider.connection.getMinimumBalanceForRentExemption(
			MINT_SIZE
		);

	console.log(`a new mintKey address is ${new_mintKey.publicKey}`);
	const NewNftTokenAccount = await getAssociatedTokenAddress(
		new_mintKey.publicKey,
		wallet.publicKey
	);
	console.log("The New NFT Account: ", NewNftTokenAccount.toBase58());

	const mint_tx = new anchor.web3.Transaction().add(
		anchor.web3.SystemProgram.createAccount({
			fromPubkey: wallet.publicKey,
			newAccountPubkey: new_mintKey.publicKey,
			space: MINT_SIZE,
			programId: TOKEN_PROGRAM_ID,
			lamports,
		}),
		createInitializeMintInstruction(
			new_mintKey.publicKey,
			0,
			wallet.publicKey,
			wallet.publicKey
		),
		createAssociatedTokenAccountInstruction(
			wallet.publicKey,
			NewNftTokenAccount,
			wallet.publicKey,
			new_mintKey.publicKey
		)
	);

	const res = await program.provider.sendAndConfirm(mint_tx, [new_mintKey]);
	console.log(
		await program.provider.connection.getParsedAccountInfo(
			new_mintKey.publicKey
		)
	);

	console.log("Account: ", res);
	console.log("New Mint key: ", new_mintKey.publicKey.toString());
	console.log("User: ", wallet.publicKey.toString());

	const current_supply_before = parseInt(
		(await provider.connection.getTokenSupply(new_mintKey.publicKey)).value
			.amount
	);

	console.log(`current supply is ${current_supply_before}`);

	assert.ok(current_supply_before === 0);

	const tx = await program.methods
		.mintNft()
		.accounts({
			mint: new_mintKey.publicKey,
			tokenAccount: NewNftTokenAccount,
			tokenProgram: TOKEN_PROGRAM_ID,
			payer: wallet.publicKey,
		})
		.rpc();

	console.log("Your transaction signature", tx);
	const current_supply_after = parseInt(
		(await provider.connection.getTokenSupply(new_mintKey.publicKey)).value
			.amount
	);
	console.log(`current supply is ${current_supply_after}`);

	assert.ok(current_supply_after === 1);

	console.log(
		`a new mint account has been created at ${new_mintKey.publicKey}`
	);

	//TODO: get the metadata and master edition, as well as the token account of the original mint account
	const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
		"metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
	);

	const NftTokenAccount = await getAssociatedTokenAddress(
		mintKey.publicKey,
		wallet.publicKey
	);

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

	const metadataAddress = await getMetadata(mintKey.publicKey);

	console.log("Metadata address: ", metadataAddress.toBase58());

	// const tx1 = await program.methods
	//   .createMetadataAccount(
	//     new_mintKey.publicKey,
	//     "https://gateway.pinata.cloud/ipfs/QmQNtiFGzdo8eQbmHTGpxX3LwhmWe49StstvLqXx8GRt3E",
	//     "Ronnie Coleman NFT",
	//     "LWB"
	//   )
	//   .accounts({
	//     mintAuthority: wallet.publicKey,
	//     mint: mintKey.publicKey,
	//     tokenProgram: TOKEN_PROGRAM_ID,
	//     metadata: metadataAddress,
	//     tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
	//     payer: wallet.publicKey,
	//     systemProgram: SystemProgram.programId,
	//     rent: anchor.web3.SYSVAR_RENT_PUBKEY,
	//   })
	//   .rpc();
	// console.log("Your transaction signature", tx1);

	const getMasterEdition = async (
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

	const masterEdition = await getMasterEdition(mintKey.publicKey);

	console.log("MasterEdition: ", masterEdition.toBase58());

	// const tx2 = await program.methods
	//   .createMasterEdition(null)
	//   .accounts({
	//     mintAuthority: wallet.publicKey,
	//     mint: mintKey.publicKey,
	//     tokenProgram: TOKEN_PROGRAM_ID,
	//     metadata: metadataAddress,
	//     tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
	//     payer: wallet.publicKey,
	//     systemProgram: SystemProgram.programId,
	//     rent: anchor.web3.SYSVAR_RENT_PUBKEY,
	//     masterEdition: masterEdition,
	//   })
	//   .rpc();
	// console.log("Your transaction signature", tx2);

	//TODO: Create a new metadata account
	const newMetadataAddress = await getMetadata(new_mintKey.publicKey);

	console.log("New metadata address: ", newMetadataAddress.toBase58());

	const tx3 = await program.methods
		.createMetadataAccount(
			new_mintKey.publicKey,
			"https://gateway.pinata.cloud/ipfs/QmQNtiFGzdo8eQbmHTGpxX3LwhmWe49StstvLqXx8GRt3E",
			"Ronnie Coleman NFT",
			"LWB"
		)
		.accounts({
			mintAuthority: wallet.publicKey,
			mint: new_mintKey.publicKey,
			tokenProgram: TOKEN_PROGRAM_ID,
			metadata: newMetadataAddress,
			tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
			payer: wallet.publicKey,
			systemProgram: SystemProgram.programId,
			rent: anchor.web3.SYSVAR_RENT_PUBKEY,
		})
		.rpc();
	console.log("Your transaction signature", tx3);
	//TODO: Create a new edition account

	const newMasterEdition = await getMasterEdition(new_mintKey.publicKey);

	console.log("New masterEdition: ", newMasterEdition.toBase58());

	const tx4 = await program.methods
		.createMasterEdition(null)
		.accounts({
			mintAuthority: wallet.publicKey,
			mint: new_mintKey.publicKey,
			tokenProgram: TOKEN_PROGRAM_ID,
			metadata: newMetadataAddress,
			tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
			payer: wallet.publicKey,
			systemProgram: SystemProgram.programId,
			rent: anchor.web3.SYSVAR_RENT_PUBKEY,
			masterEdition: newMasterEdition,
		})
		.rpc();
	console.log("Your transaction signature", tx4);

	//TODO: CREATE a Edition Mark PDA

	const getEditionMarkPDA = async (
		mint: anchor.web3.PublicKey,
		edition_number: number
	): Promise<anchor.web3.PublicKey> => {
		return (
			await anchor.web3.PublicKey.findProgramAddress(
				[
					Buffer.from("metadata"),
					TOKEN_METADATA_PROGRAM_ID.toBuffer(),
					mint.toBuffer(),
					Buffer.from("edition"),
					new Uint8Array(edition_number / 248),
				],
				TOKEN_METADATA_PROGRAM_ID
			)
		)[0];
	};

	const editionMarkPDA = await getEditionMarkPDA(mintKey.publicKey, 1);

	console.log(`EditionMarkPDA address is ${editionMarkPDA}`);
	try {
		const tx5 = await program.methods
			.createNewEditionNft((1)[0])
			.accounts({
				originalMint: mintKey.publicKey,
				newMetadata: newMetadataAddress,
				newEdition: newMasterEdition,
				masterEdition: masterEdition,
				newMint: new_mintKey.publicKey,
				editionMarkPda: editionMarkPDA,
				newMintAuthority: wallet.publicKey,
				payer: wallet.publicKey,
				tokenAccountOwner: wallet.publicKey,
				tokenAccount: NftTokenAccount,
				newMetadataUpdateAuthority: wallet.publicKey,
				metadata: metadataAddress,
				tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
				tokenProgram: TOKEN_PROGRAM_ID,
				systemProgram: SystemProgram.programId,
				rent: anchor.web3.SYSVAR_RENT_PUBKEY,
			})
			.rpc();
		console.log("Your transaction signature", tx5);
	} catch (e) {
		console.log(e);
	}
};
dodo();
