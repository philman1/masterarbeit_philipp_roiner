/* Class wrapper that holds a CID from the IPFS. */
export class CID {
	constructor(cid) {
		this.cid = cid;
	}

	get cidText() {
		return this.cid;
	}
}
