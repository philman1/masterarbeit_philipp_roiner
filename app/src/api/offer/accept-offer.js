import { web3 } from "@project-serum/anchor";
import { useWorkspace } from "@/composables";

export const acceptOffer = async (offer_maker, mint) => {
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

		const [license_account] = await web3.PublicKey.findProgramAddress(
			[offer_maker.toBuffer(), Buffer.from("license"), mint.toBuffer()],
			program.value.programId
		);

		console.log(offer_maker.toBase58(), mint.toBase58());
		console.log(offer_account.toBase58());
		console.log(offer_escrow_account.toBase58());
		console.log("license account: ", license_account.toBase58());

		const tx = await program.value.methods
			.acceptOffer()
			.accounts({
				license: license_account,
				offerAccount: offer_account, // publickey for our new account
				offerEscrowAccount: offer_escrow_account,
				offerMaker: offer_maker,
				author: wallet.value.publicKey,
				systemProgram: web3.SystemProgram.programId, // just for Anchor reference
			})
			.rpc();

		console.log(`Successfully accepted offer with tx: ${tx}`);

		const license = await program.value.account.license.fetch(
			license_account
		);
		console.log("license owner: ", license.owner.toBase58());
	} catch (e) {
		console.log(e);
	}
};
