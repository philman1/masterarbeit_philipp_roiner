<script setup>
import { ref, onMounted } from "vue";
import {
	fetchOffers,
	authorFilter,
	acceptOffer,
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

const declineOffer = async () => {};
</script>

<template>
	<div v-if="authorOffers.length > 0">
		<div class="px-4 py-5 sm:px-6">
			<h3 class="text-lg font-medium leading-6 text-gray-900">
				Open offers
			</h3>
			<p class="mt-1 max-w-2xl text-sm text-gray-500">
				you are the author.
			</p>
		</div>

		<action-table
			:headings="[
				'Offer',
				'Offer maker',
				'Mint',
				'Author',
				'Price',
				'Offer uri',
				'',
			]"
			:data="authorOffers"
			:actions="actions"
		/>
		<!-- <div class="overflow-hidden rounded relative m-5">
			<table class="w-full text-sm text-left text-gray-500">
				<thead class="text-xs text-gray-900 uppercase bg-gray-100">
					<tr>
						<th scope="col" class="py-3 px-6">Mint</th>
						<th scope="col" class="py-3 px-6">Offer maker</th>
						<th scope="col" class="py-3 px-6">Offer uri</th>
						<th scope="col" class="py-3 px-6">Price</th>
						<th scope="col" class="py-3 px-6"></th>
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="{ account } of authorOffers"
						:key="
							account.offerMaker.toBase58() +
							account.mint.toBase58()
						"
						class="bg-white border-b"
					>
						<th
							scope="row"
							class="py-4 px-6 font-medium text-gray-900 whitespace-nowrap"
						>
							<hash-link :hash="account.mint.toBase58()" />
						</th>
						<td class="py-4 px-6">
							<hash-link :hash="account.offerMaker.toBase58()" />
						</td>
						<td class="py-4 px-6">
							<ipfs-link :cid="account.offerUri" />
						</td>
						<td class="py-4 px-6">
							{{ account.offerPrice }} SOL <br />
							Minus network fees
						</td>
						<td class="py-4 px-6">
							<button
								class="flex ml-auto text-white bg-blue-500 border-0 py-2 px-6 mb-2 focus:outline-none hover:bg-red-600 rounded"
								@click="
									() =>
										acceptOfferAndCreateLicense(
											account.offerMaker,
											account.mint
										)
								"
							>
								Accept offer
							</button>
							<button
								class="flex ml-auto text-white bg-blue-500 border-0 py-2 px-6 focus:outline-none hover:bg-red-600 rounded"
								@click="declineOffer"
							>
								Decline offer
							</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div> -->
	</div>
</template>
