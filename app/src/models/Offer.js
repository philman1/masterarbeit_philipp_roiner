import { PublicKey } from "@metaplex-foundation/js";
import { CID } from "./CID";

/* Class that represents an offer. */
export class Offer {
	constructor(publicKey, data) {
		this.publicKey = new PublicKey(publicKey);
		this.offerMaker = new PublicKey(data.offerMaker);
		this.mint = new PublicKey(data.mint);
		this.author = new PublicKey(data.author);
		this.offerPrice = data.offerPrice;
		this.offerUri = new CID(data.offerUri);
	}

	/**
	 * Returns the offer accounts public key in base58 format.
	 * @returns The public key.
	 */
	get publicKeyB58() {
		return this.publicKey.toBase58();
	}

	/**
	 * Returns the offer makers public key in base58 format.
	 * @returns The offer makers public key.
	 */
	get offerMakerB58() {
		return this.offerMaker.toBase58();
	}

	/**
	 * Returns the public key of the mint that corresponds to the offer in base58 format.
	 * @returns The public key of the mint.
	 */
	get mintB58() {
		return this.mint.toBase58();
	}

	/**
	 * Returns the authors public key in base58 format.
	 * @returns The authors public key.
	 */
	get authorB58() {
		return this.author.toBase58();
	}

	/**
	 * Returns the price for the offer with additional text.
	 * @returns The price of the offer.
	 */
	get offerPriceHtml() {
		return `${this.offerPrice} SOL\n Minus network fees`;
	}

	/**
	 * Returns the link to the license information on the IPFS
	 * @returns Link to the license information.
	 */
	get offerUriCID() {
		return this.offerUri.cidText;
	}
}
