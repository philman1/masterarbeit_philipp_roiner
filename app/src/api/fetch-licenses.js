import { BN, web3 } from "@project-serum/anchor";
import { useWorkspace } from "@/composables";
import { License } from "@/models/License";
import { getImageAccount } from "./fetch-images";

/**
 * Fetches all license acounts from the blockchain
 * @param [filters] - An array of filters to apply to the request.
 * @returns An array of License objects.
 */
export const fetchLicenses = async (filters = []) => {
	const { program } = useWorkspace();
	const licenses = await program.value.account.license.all(filters);
	return licenses.map(
		(license) => new License(license.publicKey, license.account)
	);
};

/**
 * Returns a filter that will match a license account whose owner is the given public key
 * @param ownerBase58PublicKey - The public key of the owner.
 */
export const licenseOwnerFilter = (ownerBase58PublicKey) => ({
	memcmp: {
		offset:
			8 + // Discriminator
			1, // License type
		bytes: ownerBase58PublicKey,
	},
});

/**
 * Returns a filter that will match a license account whose owner is the given public key
 * @param imageBase58PubKey - The public key of the image account.
 */
export const licensesForImage = (imageBase58PubKey) => ({
	memcmp: {
		offset:
			8 + // Discriminator
			1 + // License type
			32, // License owner
		bytes: imageBase58PubKey,
	},
});

/**
 * Requests the Solana program to transfer the amount of the prize to the author and create a corresponding RF license on the blockchain.
 * @param mint - The public key of the mint.
 * @param author - The public key of the author of the image.
 */
export const buyRfLicense = async (mint, author) => {
	const { wallet, program } = useWorkspace();

	try {
		const licensePDA = (
			await web3.PublicKey.findProgramAddress(
				[
					wallet.value.publicKey.toBuffer(),
					Buffer.from("license"),
					mint.toBuffer(),
				],
				program.value.programId
			)
		)[0];

		const imageAccount = await getImageAccount(
			mint,
			author,
			program.value.programId
		);

		const tx = await program.value.methods
			.buyRfLicense()
			.accounts({
				license: licensePDA,
				imageAccount: imageAccount,
				payer: wallet.value.publicKey,
				author: author,
				systemProgram: web3.SystemProgram.programId,
			})
			.rpc();

		console.log("Your transaction signature", tx);
	} catch (e) {
		console.log(e);
	}
};

/**
 * Requests the Solana program to create a RM license on the blockchain.
 * @param address - The address of the license recipient
 * @param mint - The mint account that the license is being created for.
 * @param validUntil - Date indicating the duration of validity.
 * @param licenseInformation - String that contains a link to the offer informatino (IPFS).
 */
export const createLicense = async (
	address,
	mint,
	validUntil,
	licenseInformation
) => {
	const { wallet, program } = useWorkspace();
	try {
		const licensePDA = (
			await web3.PublicKey.findProgramAddress(
				[address.toBuffer(), Buffer.from("license"), mint.toBuffer()],
				program.value.programId
			)
		)[0];

		const imageAccount = await getImageAccount(
			mint,
			wallet.value.publicKey,
			program.value.programId
		);

		const tx = await program.value.methods
			.createLicense(
				new BN(Math.floor(validUntil.getTime() / 1000)),
				licenseInformation
			)
			.accounts({
				license: licensePDA,
				imageAccount: imageAccount,
				licenseRecipient: address,
				author: wallet.value.publicKey,
				systemProgram: web3.SystemProgram.programId,
			})
			.rpc();

		console.log("Your transaction signature", tx);
	} catch (e) {
		console.log(e);
	}
};
