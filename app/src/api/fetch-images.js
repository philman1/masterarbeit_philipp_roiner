import { BN, web3 } from "@project-serum/anchor";
import { useWorkspace } from "@/composables";
import { Image } from "@/models/Image";

/**
 * Fetches all image acounts from the blockchain
 * @param [filters] - An array of filters to apply to the request.
 * @returns An array of Image objects.
 */
export const fetchImages = async (filters = []) => {
	const { program } = useWorkspace();
	const images = await program.value.account.image.all(filters);
	return images.map((image) => new Image(image.publicKey, image.account));
};

/**
 * Returns a filter that will match a image account whose mint is the given public key
 * @param mintBase58PublicKey - The public key of the mint.
 */
export const mintAddressFilter = (mintBase58PublicKey) => ({
	memcmp: {
		offset:
			8 + // Discriminator
			32 + // Author
			8, // Timestamp
		bytes: mintBase58PublicKey,
	},
});

/**
 * Returns a filter that will match a image account whose availability is the given one.
 * @param availability - The availability.
 */
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

/**
 * Returns a filter that will match a image account whose author is the given public key
 * @param authorBase58PublicKey - The public key of the author.
 */
export const imageAuthorFilter = (authorBase58PublicKey) => ({
	memcmp: {
		offset: 8, // Discriminator
		bytes: authorBase58PublicKey,
	},
});

/**
 * Returns the Program Derived Address for the given seeds that will be used to create or find a image account.
 * @param mint - The mint address of the token
 * @param author - The public key of the account that owns the image.
 * @param programId - The program ID of the program.
 * @returns The public key for the PDA.
 */
export const getImageAccount = async (mint, author, programId) =>
	(
		await web3.PublicKey.findProgramAddress(
			[mint.toBuffer(), Buffer.from("image"), author.toBuffer()],
			programId
		)
	)[0];

/**
 * This function will update the availability of an image account on the blockchain.
 * @param mint - The public key of the mint that corresponds to the image account.
 * @param value - The new value of the image availability.
 */
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

/**
 * This function will update the license type of an image account on the blockchain.
 * @param mint - The public key of the mint that corresponds to the image account.
 * @param value - The new value of the images license type.
 */
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

/**
 * This function will update the one time price of an image account on the blockchain.
 * @param mint - The public key of the mint that corresponds to the image account.
 * @param value - The new value of the one time price.
 */
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
