import { dateFromTimestamp, pastDateFromTimeStamp } from "@/composables";
import { PublicKey } from "@metaplex-foundation/js";
import { CID } from "./CID";

/* Class that represents a license */
export class License {
	constructor(publicKey, data) {
		this.publicKey = new PublicKey(publicKey);
		this.licenseType = data.licenseType;
		this.owner = new PublicKey(data.owner);
		this.licensedImage = new PublicKey(data.licensedImage);
		this.timestamp = data.timestamp;
		this.validUntil = data.validUntil;
		this.licenseInformation = new CID(data.licenseInformation);
	}

	/**
	 * Returns the license accounts public key in base58 format.
	 * @returns The public key.
	 */
	get publicKeyB58() {
		return this.publicKey.toBase58();
	}

	/**
	 * Returns the license type.
	 * @returns The license type as Number.
	 */
	get licenseTypeAsText() {
		return this.licenseType;
	}

	/**
	 * Returns the owners public key in base58 format.
	 * @returns The owners public key.
	 */
	get ownerB58() {
		return this.owner.toBase58();
	}

	/**
	 * Returns the public key of the licensed image mint in base58 format.
	 * @returns The public key of the licensed image mint.
	 */
	get licensedImageB58() {
		return this.licensedImage.toBase58();
	}

	/**
	 * Returns the date where the license was created in the format of "dd.mm.yyyy"
	 * @returns The date where the license was created at
	 */
	get createdAt() {
		return dateFromTimestamp(this.timestamp);
	}

	/**
	 * Returns the number of days since the license was created on the blockchain.
	 * @returns The number of days since the license was created.
	 */
	get createdAgo() {
		return pastDateFromTimeStamp(this.timestamp);
	}

	/**
	 * Returns the date until when the license is valid.
	 * If no date is specified returns the string "Infinite".
	 * @returns Date until the license is valid.
	 */
	get validUntilDate() {
		return this.validUntil ? dateFromTimestamp(this.validUntil) : "Infinite";
	}

	/**
	 * Returns the link to the license information on the IPFS.
	 * @returns The link to the license informatino.
	 */
	get licenseInformationCID() {
		return this.licenseInformation.cidText
			? this.licenseInformation.cidText
			: "";
	}
}
