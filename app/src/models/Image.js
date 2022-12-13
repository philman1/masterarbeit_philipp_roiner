import { PublicKey } from "@metaplex-foundation/js";

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
		return new Date(Number(this.timestamp) * 1000).toLocaleDateString(
			"de-DE"
		);
	}

	get createdAgo() {
		return `${(
			(new Date() - new Date(Number(this.timestamp) * 1000)) /
			(1000 * 60 * 60 * 24)
		).toFixed()} days ago`;
	}

	get mintAddressB58() {
		return this.mintAddress.toBase58();
	}

	get availability() {
		return this.available ? "public" : "private";
	}

	get allowedLicenseTypesAsText() {
		return this.allowedLicenseTypes;
	}
}
