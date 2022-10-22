import {
	Metaplex,
	keypairIdentity,
	bundlrStorage,
} from "@metaplex-foundation/js";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import {
	getParsedNftAccountsByOwner,
	isValidSolanaAddress,
	createConnectionConfig,
} from "@nfteyez/sol-rayz";
import { create } from "ipfs-http-client";
import { concat } from "uint8arrays";
import { useWorkspace } from "@/composables";

const connection = new Connection(clusterApiUrl("devnet"));
const ipfs = create({
	url: "http://localhost:5001",
});

export const fetchNfts = async () => {
	const { wallet, provider } = useWorkspace();
	try {
		const connect = createConnectionConfig(clusterApiUrl("devnet"));
		let ownerToken = provider.value.publicKey;
		const valid = isValidSolanaAddress(ownerToken);
		if (!valid) throw "error";
		const nfts = await getParsedNftAccountsByOwner({
			publicAddress: ownerToken,
			connection: connect,
			serialization: true,
		});
		return nfts;
	} catch (error) {
		console.log(error);
	}

	const creator = wallet.value.publicKey;

	const metaplex = Metaplex.make(connection)
		.use(keypairIdentity(wallet.value))
		.use(bundlrStorage());
	return await metaplex.nfts().findAllByCreator({ creator, position: 2 }); // Equivalent to the previous line.
};

export const fetchMetadataFromIpfs = (nfts) =>
	Promise.all(
		nfts.map(async (nft) => {
			if (nft.data.uri && !nft.data.uri.includes("ipfs://")) {
				let chunks = [],
					uri = nft.data.uri;
				if (uri.includes("ipfs")) {
					uri = uri.substring(21);
				}
				console.log(nft.data.uri, uri);
				for await (const chunk of ipfs.cat(uri)) {
					chunks.push(chunk);
				}

				const data = concat(chunks);
				const decodedData = JSON.parse(
					new TextDecoder().decode(data).toString()
				);
				return { ...nft, offchainMetadata: decodedData };
			}
		})
	);

export const fetchImageFromIpfs = async (metadata) => {
	const img = await loadImgURL(metadata.image);
	return img;
};

async function loadImgURL(cid) {
	if (
		cid == "" ||
		cid == null ||
		cid == undefined ||
		cid.includes("ipfs://")
	) {
		return;
	}
	let uri = cid;
	if (cid.includes("ipfs")) {
		uri = uri.substring(21);
	}
	const res = await fetch("http://localhost:8080/ipfs/" + uri);
	return res.url;
}
