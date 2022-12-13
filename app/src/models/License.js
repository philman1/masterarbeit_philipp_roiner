import { dateFromTimestamp, pastDateFromTimeStamp } from "@/composables";
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
		return dateFromTimestamp(this.timestamp);
	}

	get createdAgo() {
		return pastDateFromTimeStamp(this.timestamp);
	}

	get licenseInformationCID() {
		return this.licenseInformation.cidText;
	}
}
