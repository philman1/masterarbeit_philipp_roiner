import { useWorkspace } from "@/composables";
import { Image } from "@/models/Image";

export const fetchImages = async (filters = []) => {
	const { program } = useWorkspace();
	const images = await program.value.account.image.all(filters);
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
