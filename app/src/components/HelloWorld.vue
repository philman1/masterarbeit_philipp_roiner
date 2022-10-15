<template>
	<div v-for="nft of arr" :key="nft">{{ nft }}</div>
	<img id="img" alt="" />
</template>

<script setup>
/* eslint-disable no-unused-vars */
import { ref } from "vue";
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

import { useWorkspace } from "@/composables";
import { create } from "ipfs-http-client";
// import { concat } from "uint8arrays";

const { provider, wallet } = useWorkspace();

const ipfs = create({
	url: "http://localhost:5001",
});

const nfts = ref([]);
// let arr = ref([]);
// let src = ref();

// const test = async () => {
// 	const n = await program.value.account.mintNft.all();
// 	console.log(n);
// };

// test();

//Function to get all NFT information from wallet.
const getAllNftData = async () => {};

/** Uses `URL.createObjectURL` free returned ObjectURL with `URL.RevokeObjectURL` when done with it.
 *
 * @param {string} cid CID you want to retrieve
 * @param {string} mime mimetype of image (optional, but useful)
 * @param {number} limit size limit of image in bytes
 * @returns ObjectURL
 */
async function loadImgURL(cid, mime = "image/jpeg", limit) {
	if (cid == "" || cid == null || cid == undefined) {
		return;
	}
	fetch("http://localhost:8080/ipfs/" + cid).then(
		(res) => (document.getElementById("img").src = res.url)
	);
	for await (const file of ipfs.get(cid)) {
		if (file.size > limit) {
			return;
		}
		return URL.createObjectURL(new Blob(file, { type: mime }));
		// const content = [];
		// if (file.content) {
		// 	for await (const chunk of file.content) {
		// 		content.push(chunk);
		// 	}
		// 	return URL.createObjectURL(new Blob(content, { type: mime }));
		// }
	}
}

// getAllNftData().then((fetchedNfts) => {
// 	nfts.value = fetchedNfts;

// 	let chunks = [];

// 	fetchedNfts.forEach(async (nft) => {
// 		if (nft.data.uri) {
// 			// console.log(nft, nft.data.uri.slice(7));
// 			// const img = await loadImgURL(nft.data.uri.slice(7));
// 			// console.log(img);
// 			// arr.value.push(img);
// 			for await (const chunk of ipfs.cat(nft.data.uri.slice(7))) {
// 				chunks.push(chunk);
// 			}

// 			const data = concat(chunks);
// 			const decodedData = JSON.parse(
// 				new TextDecoder().decode(data).toString()
// 			);
// 			await loadImgURL(decodedData.image.slice(7));
// 			// document.getElementById("img").src = img;
// 		}
// 		// console.log(arr.value);
// 	});
// });

const f = async () => {
	const creator = wallet.value.publicKey;
	const connection = new Connection(clusterApiUrl("devnet"));
	const metaplex = Metaplex.make(connection)
		.use(keypairIdentity(wallet.value))
		.use(bundlrStorage());
	const nfts = await metaplex
		.nfts()
		.findAllByCreator({ creator, position: 1 }); // Equivalent to the previous line.
	console.log(nfts);
};

f();
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
	margin: 40px 0 0;
}
ul {
	list-style-type: none;
	padding: 0;
}
li {
	display: inline-block;
	margin: 0 10px;
}
a {
	color: #42b983;
}
</style>
