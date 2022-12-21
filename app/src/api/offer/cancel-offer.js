import { web3 } from "@project-serum/anchor";
import { useWorkspace } from "@/composables";

/**
 * Requests the Solana program to cancel the given offer.
 * @param offer_maker - The public key of the offer maker
 * @param mint - The public key of mint that the offer is for
 */
export const cancelOffer = async (offer_maker, mint) => {
	const { wallet, program } = useWorkspace();

	try {
		const [offer_account] = await web3.PublicKey.findProgramAddress(
			[offer_maker.toBuffer(), mint.toBuffer()],
			program.value.programId
		);
		const [offer_escrow_account] = await web3.PublicKey.findProgramAddress(
			[offer_maker.toBuffer(), Buffer.from("escrow"), mint.toBuffer()],
			program.value.programId
		);

		console.log(offer_maker.toBase58(), mint.toBase58());
		console.log(offer_account.toBase58());
		console.log(offer_escrow_account.toBase58());

		const tx = await program.value.methods
			.cancelOffer()
			.accounts({
				offerAccount: offer_account,
				offerEscrowAccount: offer_escrow_account,
				offerMaker: offer_maker,
				author: wallet.value.pubicKey,
				systemProgram: web3.SystemProgram.programId,
			})
			.rpc();

		console.log(`Successfully canceld offer with tx: ${tx}`);
	} catch (e) {
		console.log(e);
	}
};
