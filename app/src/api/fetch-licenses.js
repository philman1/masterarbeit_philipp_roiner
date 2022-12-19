import { BN, web3 } from "@project-serum/anchor";
import { useWorkspace } from "@/composables";
import { License } from "@/models/License";
import { getImageAccount } from "./fetch-images";

export const fetchLicenses = async (filters = []) => {
	const { program } = useWorkspace();
	const licenses = await program.value.account.license.all(filters);
	return licenses.map(
		(license) => new License(license.publicKey, license.account)
	);
};

export const licenseOwnerFilter = (ownerBase58PublicKey) => ({
	memcmp: {
		offset:
			8 + // Discriminator
			1, // License type
		bytes: ownerBase58PublicKey,
	},
});

export const licensesForImage = (imageBase58PubKey) => ({
	memcmp: {
		offset:
			8 + // Discriminator
			1 + // License type
			32, // License owner
		bytes: imageBase58PubKey,
	},
});

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
