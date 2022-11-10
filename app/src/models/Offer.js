import { PublicKey } from "@metaplex-foundation/js";
import { CID } from "./CID";

export class Offer {
	constructor(publicKey, data) {
		this.publicKey = new PublicKey(publicKey);
		this.offerMaker = new PublicKey(data.offerMaker);
		this.mint = new PublicKey(data.mint);
		this.author = new PublicKey(data.author);
		this.offerPrice = data.offerPrice;
		this.offerUri = new CID(data.offerUri);
	}

	get publicKeyB58() {
		return this.publicKey.toBase58();
	}

	get offerMakerB58() {
		return this.offerMaker.toBase58();
	}

	get mintB58() {
		return this.mint.toBase58();
	}

	get authorB58() {
		return this.author.toBase58();
	}

	get offerPriceHtml() {
		return `${this.offerPrice} SOL\n Minus network fees`;
	}

	get offerUriCID() {
		return this.offerUri.cidText;
	}
}
