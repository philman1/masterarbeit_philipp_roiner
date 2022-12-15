import { PublicKey } from "@metaplex-foundation/js";
import { dateFromTimestamp, pastDateFromTimeStamp } from "@/composables";

/* It's a class that represents an image. */
export class Image {
	constructor(publicKey, data) {
		this.publicKey = new PublicKey(publicKey);
		this.author = new PublicKey(data.author);
		this.timestamp = data.timestamp;
		this.mintAddress = new PublicKey(data.mintAddress);
		this.available = data.available;
		this.allowedLicenseTypes = data.allowedLicenseTypes;
	}

	/**
	 * Returns the image accounts public key in base58 format.
	 * @returns The public key.
	 */
	get publicKeyB58() {
		return this.publicKey.toBase58();
	}

	/**
	 * Returns the authors public key in base58 format.
	 * @returns The authors public key.
	 */
	get authorB58() {
		return this.author.toBase58();
	}

	/**
	 * Returns the date where the image was created in the format of "dd.mm.yyyy"
	 * @returns The date where the image was created at
	 */
	get createdAt() {
		return dateFromTimestamp(this.timestamp);
	}

	/**
	 * Returns the number of days since the image was created on the blockchain.
	 * @returns The number of days since the image was created.
	 */
	get createdAgo() {
		return pastDateFromTimeStamp(this.timestamp);
	}

	/**
	 * Returns the mintAddress in base58 format.
	 * @returns The mintAddres.
	 */
	get mintAddressB58() {
		return this.mintAddress.toBase58();
	}

	/**
	 * The function returns the string "public" if the value of the available property is true, and
	 * returns the string "private" if the value of the available property is false
	 * @returns The availability of the image.
	 */
	get availability() {
		return this.available ? "Public" : "Private";
	}

	/**
	 * Returns the value of the allowedLicenseTypes property.
	 * @returns The allowedLicenseTypes property.
	 */
	get allowedLicenseTypesAsText() {
		return this.allowedLicenseTypes;
	}
}
