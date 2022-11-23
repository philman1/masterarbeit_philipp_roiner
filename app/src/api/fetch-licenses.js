import { useWorkspace } from "@/composables";
import { License } from "@/models/License";

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
