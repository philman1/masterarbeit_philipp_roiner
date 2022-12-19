import { create } from "ipfs-http-client";
import { concat } from "uint8arrays";
import { PublicKey } from "@metaplex-foundation/js";
import { useMetaplex } from "@/composables";
import store from "@/store";
import { fetchImages } from "./fetch-images";

const ipfs = create({
	url: "http://127.0.0.1:5001/",
});

export const fetchNft = async (mint) => {
	try {
		const { metaplex } = useMetaplex();
		const mintAddress = new PublicKey(mint);
		let nft = await metaplex.nfts().findByMint({ mintAddress });
		if (!nft.jsonLoaded) nft = await fetchMetadataFromIpfs(nft);

		const image = await fetchImageFromIpfs(nft);
		return { imageUri: image, ...nft };
	} catch (error) {
		console.log(error);
	}
};

export const fetchNfts = async (filters) => {
	try {
		const { metaplex } = useMetaplex();
		const imageAccounts = await fetchImages(filters);
		const mints = imageAccounts.map((i) => i.mintAddress);
		const metadatas = await metaplex.nfts().findAllByMintList({
			mints,
		});
		console.log(imageAccounts, metadatas);

		const result = imageAccounts.map((i) => {
			const m = metadatas.find(
				(m) => m.mintAddress.toBase58() == i.mintAddress.toBase58()
			);
			return {
				imageAccount: i,
				nftMetadata: m,
			};
		});

		return result;
	} catch (error) {
		console.log(error);
	}
};

export const fetchNftsByCreator = async (creator) => {
	try {
		const { metaplex } = useMetaplex();
		const metadatas = await metaplex.nfts().findAllByCreator({
			creator,
		});
		const nfts = await Promise.all(
			metadatas.map(
				async (metadata) => await metaplex.nfts().load({ metadata })
			)
		);
		return nfts;
	} catch (e) {
		console.log(e);
	}
};

export const fetchMetadataFromIpfs = async (nft) => {
	if (nft.jsonLoaded) return nft;
	if (nft.uri && !nft.uri.includes("ipfs://")) {
		let chunks = [],
			uri = nft.uri;
		if (uri.includes("ipfs")) {
			uri = uri.substring(21);
		}
		// console.log(nft.uri, uri);
		for await (const chunk of ipfs.cat(uri)) {
			chunks.push(chunk);
		}

		const data = concat(chunks);
		const decodedData = JSON.parse(new TextDecoder().decode(data).toString());
		return { ...nft, json: decodedData };
	}
};

export const fetchImageFromIpfs = async (nft) => {
	const metadata = nft.json;
	const img = await loadImgURL(metadata.image);
	const mint = nft.mintAddress ? nft.mintAddress : nft.mint.address;
	store.commit("setImgDataForNft", {
		mint: mint.toBase58(),
		uri: img,
	});
	return img;
};

async function loadImgURL(cid) {
	if (cid == "" || cid == null || cid == undefined || cid.includes("ipfs://")) {
		return;
	}
	let uri = cid;
	if (cid.includes("ipfs")) {
		uri = uri.substring(21);
	}

	const res = await fetch("http://localhost:8080/ipfs/" + uri);
	// const chunks = [];
	// for await (const chunk of ipfs.cat(uri)) {
	// 	chunks.push(chunk);
	// }
	// console.log(chunks);
	return res.url;
}
