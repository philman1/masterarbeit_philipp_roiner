import { fetchNft } from "@/api";
import store from "@/store";
import { req } from "@/api";
import { useWallet } from "solana-wallets-vue";

export const downloadDecryptedImage = async (mint) => {
	const { publicKey, signMessage } = useWallet();
	let nft = store.getters.findNftByMint(mint);
	if (!nft) nft = await fetchNft(mint);
	const cid = nft.json.fullResImg;

	req(
		{
			method: "POST",
			url: "http://localhost:3000/decrypt-image",
			headers: {
				"Content-Type": "application/json",
			},
			data: JSON.stringify({
				data: {
					mint,
					cid,
				},
			}),
		},
		"decrypt:image",
		{ publicKey: publicKey.value, signMessage: signMessage.value }
	)
		.then((res) => res.json())
		.then((json) => {
			console.log(json);
			const { buff } = json;
			const a = document.createElement("a");
			a.href = `data:image/png;base64,${buff}`;
			a.download = "image.png";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		});
};
