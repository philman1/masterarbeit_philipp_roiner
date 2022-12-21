import { web3, BN } from "@project-serum/anchor";
import { useWorkspace } from "@/composables";

/**
 * Transfers the offered amount to the offer escrow account of the offer.
 * @param price_offer - The price of the offer in SOL
 * @param mint - The public key of the mint the offer refers to.
 */
export const makeOffer = async (price_offer, mint) => {
	const { wallet, program } = useWorkspace();

	try {
		const [offer_account] = await web3.PublicKey.findProgramAddress(
			[wallet.value.publicKey.toBuffer(), mint.toBuffer()],
			program.value.programId
		);
		const [offer_escrow_account, escrow_bump] =
			await web3.PublicKey.findProgramAddress(
				[
					wallet.value.publicKey.toBuffer(),
					Buffer.from("escrow"),
					mint.toBuffer(),
				],
				program.value.programId
			);

		console.log(offer_escrow_account.toBase58(), escrow_bump);
		console.log(price_offer);

		const tx = await program.value.methods
			.makeOffer(new BN(Number(price_offer) * web3.LAMPORTS_PER_SOL))
			.accounts({
				offerAccount: offer_account, // publickey for our new account
				offerEscrowAccount: offer_escrow_account,
				offerMaker: wallet.value.publicKey,
				systemProgram: web3.SystemProgram.programId, // just for Anchor reference
			})
			.rpc();

		console.log(`Successfully payed in with tx: ${tx}`);
	} catch (e) {
		console.log(e);
	}
};
