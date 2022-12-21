import { web3 } from "@project-serum/anchor";
import { useWorkspace } from "@/composables";

/**
 * Initializes a new offer for a given mint address.
 * @param mint - The public key of the mint.
 * @param author - The public key of the mints author
 * @param offer_uri - String that contains a link to the offer informatino (IPFS)
 */
export const initializeOffer = async (mint, author, offer_uri) => {
	const { wallet, program } = useWorkspace();
	console.log(mint, author, offer_uri);
	try {
		const [offer_account, bump] = await web3.PublicKey.findProgramAddress(
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

		console.log(offer_account.toBase58());
		console.log(offer_escrow_account.toBase58(), escrow_bump);

		const tx = await program.value.methods
			.initializeOffer(bump, escrow_bump, offer_uri)
			.accounts({
				offerAccount: offer_account,
				offerEscrowAccount: offer_escrow_account,
				offerMaker: wallet.value.publicKey,
				mint: mint,
				author: author,
				systemProgram: web3.SystemProgram.programId,
			})
			.rpc();

		console.log(
			`Successfully intialized offer_account: ${offer_account.toBase58()} with escrow ${offer_escrow_account.toBase58()} for user ${
				wallet.value.publicKey
			} \n tx: ${tx}`
		);
	} catch (e) {
		console.log(e);
	}
};
