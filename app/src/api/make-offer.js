import {
	TOKEN_PROGRAM_ID,
	createAssociatedTokenAccountInstruction,
	getAssociatedTokenAddress,
	createInitializeMintInstruction,
	createMintToCheckedInstruction,
	MINT_SIZE,
} from "@solana/spl-token";
import { BN, web3 } from "@project-serum/anchor";
import { useWorkspace } from "@/composables";

export const makeOffer = async (priceOffer) => {
	const { connection, wallet, provider, program } = useWorkspace();

	try {
		const offer = await web3.Keypair.generate();
		const [pda, escrowedTokensOfOfferMakerBump] =
			await web3.PublicKey.findProgramAddress(
				[offer.publicKey.toBuffer()],
				program.value.programId
			);

		const tx = await program.value.methods
			.makeOffer(escrowedTokensOfOfferMakerBump, new BN(priceOffer))
			.accounts({
				offer: offer.publicKey,
				whoMadeTheOffer: wallet.value.publicKey,
				tokenAccountFromWhoMadeTheOffer: offerMakerCowTokenAccount,
				escrowedTokensOfOfferMaker: pda,
				kindOfTokenOffered: cowMint,
				kindOfTokenWantedInReturn: pigMint,
				tokenProgram: TOKEN_PROGRAM_ID,
				systemProgram: web3.SystemProgram.programId,
				rent: web3.SYSVAR_RENT_PUBKEY,
			})
			.signers([offer])
			.rpc();
		console.log("Your transaction signature", tx);
	} catch (e) {
		console.log(e);
	}
};
