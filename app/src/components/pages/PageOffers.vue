<script setup>
import { ref, onMounted } from "vue";
import {
	fetchOffers,
	authorFilter,
	acceptOffer,
	cancelOffer,
	fetchNft,
	mintEdition,
} from "@/api";
import { useWorkspace } from "@/composables";
import { web3 } from "@project-serum/anchor";
import store from "@/store";
import ActionTable from "../ActionTable.vue";

const authorOffers = ref([]);
const actions = ref([]);

onMounted(async () => {
	const { wallet } = useWorkspace();
	authorOffers.value = await fetchOffers([
		authorFilter(wallet.value.publicKey.toBase58()),
	]);

	console.log(authorOffers.value);

	actions.value = [
		{ fn: acceptOfferAndCreateLicense, label: "Accept offer" },
		{ fn: declineOffer, label: "Decline offer" },
	];
});

const acceptOfferAndCreateLicense = async (offer) => {
	await acceptOffer(offer.offerMaker, offer.mint);
	let nft = store.getters.findNftByMint(offer.mintB58);
	if (!nft) {
		nft = await fetchNft(offer.mintB58);
	}

	console.log(nft.mint.address.toBase58(), nft.metadataAddress.toBase58());
	await mintEdition(
		new web3.PublicKey(nft.mint.address.toBase58()),
		new web3.PublicKey(nft.metadataAddress.toBase58()),
		1
	);
};

const declineOffer = async (offer) => {
	console.log("decline");
	const res = await cancelOffer(offer.offerMaker, offer.mint);
	console.log(res);
};
</script>

<template>
	<div v-if="authorOffers.length > 0">
		<div class="px-4 py-5 sm:px-6">
			<h3 class="text-lg font-medium leading-6 text-gray-900">Open offers</h3>
			<p class="mt-1 max-w-2xl text-sm text-gray-500">you are the author.</p>
		</div>

		<action-table
			:cols="[
				{ attr: 'publicKey', heading: 'Offer' },
				{ attr: 'offerMaker', heading: 'Offer maker' },
				{ attr: 'mint', heading: 'Mint' },
				{ attr: 'author', heading: 'Author' },
				{ attr: 'offerPrice', heading: 'Price' },
				{ attr: 'offerUri', heading: 'Offer uri' },
				{ attr: null, heading: '' },
			]"
			:data="authorOffers"
			:actions="actions"
		/>
	</div>
</template>
