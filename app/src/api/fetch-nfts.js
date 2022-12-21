import { create } from "ipfs-http-client";
import { concat } from "uint8arrays";
import { PublicKey } from "@metaplex-foundation/js";
import { useMetaplex } from "@/composables";
import store from "@/store";
import { fetchImages } from "./fetch-images";

const ipfs = create({
	url: "http://127.0.0.1:5001/",
});

/**
 * Fetches a NFT including external data from the IPFS
 * @param mint - The mint address of the NFT
 */
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

/**
 * Fetches all NFT metadatas from the blockchain that have a corresponding image account
 * @param [filters] - An array of filters to apply to the request.
 * @returns An array of NFT metadatas and image accounts.
 */
export const fetchNfts = async (filters) => {
	try {
		const { metaplex } = useMetaplex();
		const imageAccounts = await fetchImages(filters);
		if (imageAccounts.length <= 0) return;
		const mints = imageAccounts.map((i) => i.mintAddress);
		const metadatas = await metaplex.nfts().findAllByMintList({
			mints,
		});
		console.log(imageAccounts, metadatas);

		const result = imageAccounts.map((i) => {
			const m = metadatas.find(
				(m) =>
					m &&
					m.mintAddress &&
					m.mintAddress.toBase58() == i.mintAddress.toBase58()
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

/**
 * Fetches all NFTs created by a given creator
 * @param creator - The address of the creator of the NFTs.
 * @returns An array of NFTs
 */
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

/**
 * Fetches the external metadata from an NFT that is stored on the IPFS
 * @param nft - The NFT for which the metadata is to be requested.
 * @returns NFT with metadata.
 */
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

/**
 * Loads the image from an NFTs metdata URL, and then
 * stores the image data in the Vuex store.
 * @param nft - The NFT object
 * @returns Image.
 */
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

/**
 * Returns the URL of a image for a given CID (Content Identifier).
 * @param cid - The cid of the image
 * @returns The URL of the image.
 */
async function loadImgURL(cid) {
	if (cid == "" || cid == null || cid == undefined || cid.includes("ipfs://")) {
		return;
	}

	let uri = cid;
	if (cid.includes("ipfs")) {
		uri = uri.substring(21);
	}

	const res = await fetch("http://localhost:8080/ipfs/" + uri);

	return res.url;
}
