import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWorkspace } from "@/composables";
import bs58 from "bs58";
import { Offer } from "@/models";

export const fetchOffers = async (filters = []) => {
	const { connection, program } = useWorkspace();
	let offers = await program.value.account.offer.all(filters);

	return Promise.all(
		offers.map(async (offer) => {
			const price = await connection.getBalance(offer.account.escrowPda);
			const o = {
				...offer,
				account: {
					...offer.account,
					offerPrice: price / LAMPORTS_PER_SOL,
				},
			};
			return new Offer(o.publicKey, o.account);
		})
	);
};

export const getEscrowedSolForOffer = async () => {};

export const authorFilter = (offerMakerBase58PublicKey) => ({
	memcmp: {
		offset:
			8 + // Discriminator
			32 + // OfferMaker public key
			32, // Mint public key
		bytes: offerMakerBase58PublicKey,
	},
});

export const mintFilter = (mintBase58PublicKey) => ({
	memcmp: {
		offset:
			8 + // Discriminator
			32, // OfferMaker public key
		bytes: mintBase58PublicKey,
	},
});

export const topicFilter = (topic) => ({
	memcmp: {
		offset:
			8 + // Descriminator
			32 + // Author public key
			8 + // Timestamp
			4, // Topic string prefix
		bytes: bs58.encode(Buffer.from(topic)),
	},
});
