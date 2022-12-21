import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWorkspace } from "@/composables";
import bs58 from "bs58";
import { Offer } from "@/models";

/**
 * Fetches all active offer accounts and the corresponding balance from the offer escrow account.
 * @param [filters] - An array of filters to apply to the request.
 * @returns An array of Offer objects.
 */
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

/**
 * Returns a filter that will match a offer account whose offer maker is the given public key
 * @param offerMakerBase58PublicKey - The public key of the offer maker.
 */
export const offerMakerFilter = (offerMakerBase58PublicKey) => ({
	memcmp: {
		offset: 8, // Discriminator
		bytes: offerMakerBase58PublicKey,
	},
});

/**
 * Returns a filter that will match a offer account whose author is the given public key
 * @param authorBase58PublicKey - The public key of the author.
 */
export const authorFilter = (authorBase58PublicKey) => ({
	memcmp: {
		offset:
			8 + // Discriminator
			32 + // OfferMaker public key
			32, // Mint public key
		bytes: authorBase58PublicKey,
	},
});

/**
 * Returns a filter that will match a offer account whose mint is the given public key
 * @param mintBase58PublicKey - The public key of the mint.
 */
export const mintFilter = (mintBase58PublicKey) => ({
	memcmp: {
		offset:
			8 + // Discriminator
			32, // OfferMaker public key
		bytes: mintBase58PublicKey,
	},
});
