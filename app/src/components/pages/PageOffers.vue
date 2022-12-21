<script setup>
import { ref, onMounted } from "vue";
import {
	fetchOffers,
	offerMakerFilter,
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
import DuoHeadline from "../basic/DuoHeadline.vue";

const offerMakerOffers = ref([]);
const offerMakerActions = ref([]);
const authorOffers = ref([]);
const authorActions = ref([]);

onMounted(async () => {
	const { wallet } = useWorkspace();
	offerMakerOffers.value = await fetchOffers([
		offerMakerFilter(wallet.value.publicKey.toBase58()),
	]);

	offerMakerActions.value = [{ fn: declineOffer, label: "Cancel offer" }];

	authorOffers.value = await fetchOffers([
		authorFilter(wallet.value.publicKey.toBase58()),
	]);

	authorActions.value = [
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
	<div v-if="offerMakerOffers.length > 0">
		<duo-headline
			importance="1"
			headline="Your offers"
			sub-headline="Open offers that you created."
		></duo-headline>

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
			:data="offerMakerOffers"
			:actions="offerMakerActions"
		/>
	</div>
	<div v-if="authorOffers.length > 0">
		<duo-headline
			importance="1"
			headline="For you"
			sub-headline="Offers for your work."
		></duo-headline>

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
			:actions="authorActions"
		/>
	</div>
</template>
