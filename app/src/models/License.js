// import dayjs from "dayjs";
import { PublicKey } from "@metaplex-foundation/js";
import { CID } from "./CID";

export class License {
	constructor(publicKey, data) {
		this.publicKey = new PublicKey(publicKey);
		this.licenseType = data.licenseType;
		this.owner = new PublicKey(data.owner);
		this.licensedImage = new PublicKey(data.licensedImage);
		this.timestamp = data.timestamp;
		this.licenseInformation = new CID(data.licenseInformation);
	}

	get publicKeyB58() {
		return this.publicKey.toBase58();
	}

	get licenseTypeAsText() {
		return this.licenseType;
	}

	get ownerB58() {
		return this.owner.toBase58();
	}

	get licensedImageB58() {
		return this.licensedImage.toBase58();
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

	get licenseInformationCID() {
		return this.licenseInformation.cidText;
	}
}
