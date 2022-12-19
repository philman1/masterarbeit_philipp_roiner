import { BN, web3 } from "@project-serum/anchor";
import { useWorkspace } from "@/composables";
import { Image } from "@/models/Image";

export const fetchImages = async (filters = []) => {
	const { program } = useWorkspace();
	const images = await program.value.account.image.all(filters);
	console.log(images[0].publicKey.toBase58());
	return images.map((image) => new Image(image.publicKey, image.account));
};

export const mintAddressFilter = (mintBase58PublicKey) => ({
	memcmp: {
		offset:
			8 + // Discriminator
			32 + // Author
			8, // Timestamp
		bytes: mintBase58PublicKey,
	},
});

export const availabilityFilter = (availability) => ({
	memcmp: {
		offset:
			8 + // Discriminator
			32 + // Author
			8 + // Timestamp
			32, // Mint Address
		bytes: availability,
	},
});

export const imageAuthorFilter = (authorBase58PublicKey) => ({
	memcmp: {
		offset: 8, // Discriminator
		bytes: authorBase58PublicKey,
	},
});

export const getImageAccount = async (mint, author, programId) =>
	(
		await web3.PublicKey.findProgramAddress(
			[mint.toBuffer(), Buffer.from("image"), author.toBuffer()],
			programId
		)
	)[0];

export const updateImageAvailability = async (mint, value) => {
	const { wallet, program } = useWorkspace();

	try {
		const imageAccount = await getImageAccount(
			mint,
			wallet.value.publicKey,
			program.value.programId
		);

		const tx = await program.value.methods
			.updateImageAvailability(value)
			.accounts({
				imageAccount: imageAccount,
				author: wallet.value.publicKey,
				systemProgram: web3.SystemProgram.programId,
			})
			.rpc();

		console.log("Your transaction signature", tx);
	} catch (e) {
		console.log(e);
	}
};

export const updateImageAllowedLicenseTypes = async (mint, value) => {
	const { wallet, program } = useWorkspace();

	try {
		const imageAccount = await getImageAccount(
			mint,
			wallet.value.publicKey,
			program.value.programId
		);

		const tx = await program.value.methods
			.updateImageAllowedLicenseTypes(new BN(value))
			.accounts({
				imageAccount: imageAccount,
				author: wallet.value.publicKey,
				systemProgram: web3.SystemProgram.programId,
			})
			.rpc();

		console.log("Your transaction signature", tx);
	} catch (e) {
		console.log(e);
	}
};

export const updateImageOneTimePrice = async (mint, value) => {
	const { wallet, program } = useWorkspace();

	try {
		const imageAccount = await getImageAccount(
			mint,
			wallet.value.publicKey,
			program.value.programId
		);

		const tx = await program.value.methods
			.updateImageOneTimePrice(new BN(Number(value) * web3.LAMPORTS_PER_SOL))
			.accounts({
				imageAccount: imageAccount,
				author: wallet.value.publicKey,
				systemProgram: web3.SystemProgram.programId,
			})
			.rpc();

		console.log("Your transaction signature", tx);
	} catch (e) {
		console.log(e);
	}
};
