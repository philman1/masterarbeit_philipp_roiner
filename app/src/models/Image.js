import { PublicKey } from "@metaplex-foundation/js";
import { dateFromTimestamp, pastDateFromTimeStamp } from "@/composables";

export class Image {
	constructor(publicKey, data) {
		this.publicKey = new PublicKey(publicKey);
		this.author = new PublicKey(data.author);
		this.timestamp = data.timestamp;
		this.mintAddress = new PublicKey(data.mintAddress);
		this.available = data.available;
		this.allowedLicenseTypes = data.allowedLicenseTypes;
	}

	get publicKeyB58() {
		return this.publicKey.toBase58();
	}

	get authorB58() {
		return this.author.toBase58();
	}

	get createdAt() {
		return dateFromTimestamp(this.timestamp);
	}

	get createdAgo() {
		return pastDateFromTimeStamp(this.timestamp);
	}

	get mintAddressB58() {
		return this.mintAddress.toBase58();
	}

	get availability() {
		return this.available ? "Public" : "Private";
	}

	get allowedLicenseTypesAsText() {
		return this.allowedLicenseTypes;
	}
}
