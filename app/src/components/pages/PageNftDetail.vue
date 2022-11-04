<script setup>
import { ref, defineProps, onMounted } from "vue";
import { web3 } from "@project-serum/anchor";
import store from "@/store";
import { fetchNft, initializeOffer, makeOffer } from "@/api";
import { useWorkspace } from "@/composables";
import HashLink from "../HashLink.vue";

const { wallet } = useWorkspace();

const props = defineProps({
	mint: String,
});

const nft = ref(null);
const mint_pk = ref(null);
const isCreator = ref(false);

// OFFER
const validPrice = ref(true);
const validUri = ref(true);
const price = ref(0.0);
const offerUri = ref("");

onMounted(async () => {
	nft.value = store.getters.findNftByMint(props.mint);
	if (!nft.value) {
		nft.value = await fetchNft(props.mint);
	}

	mint_pk.value = new web3.PublicKey(nft.value.mint.address);

	console.log(nft.value);
	isCreator.value =
		wallet.value.publicKey.toBase58() ===
		nft.value.creators[1].address.toBase58();
	// fetchEditions();
});

const initAndMakeOffer = async () => {
	if (!price.value) {
		validPrice.value = false;
		return;
	} else if (!offerUri.value) {
		validUri.value = false;
		return;
	}

	await initializeOffer(
		mint_pk.value,
		new web3.PublicKey(nft.value.creators[1].address),
		offerUri.value
	).then(async () => {
		await makeOffer(price.value, mint_pk.value).then(() => {
			console.log("success");
		});
	});
};

// const fetchEditions = async () => {
// 	const editions = await fetchNftsByCreator(
// 		new web3.PublicKey(nft.value.address.toBase58())
// 	);
// 	console.log(editions);
// };
</script>

<template>
	<section class="text-gray-700 body-font overflow-hidden bg-white">
		<div v-if="nft" class="container px-5 py-24 mx-auto">
			<div class="lg:w-4/5 mx-auto flex flex-wrap">
				<img
					alt="ecommerce"
					class="lg:w-1/2 w-full object-cover object-center rounded border border-gray-200"
					:src="nft.imageUri"
				/>
				<div class="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
					<h2
						class="text-sm title-font text-gray-500 tracking-widest"
					>
						{{ nft.json.name }}
					</h2>
					<h1
						class="text-gray-900 text-3xl title-font font-medium mb-1"
					>
						{{ nft.json.description }}
					</h1>
					<div
						class="overflow-hidden bg-white shadow sm:rounded-lg mt-3 mb-6"
					>
						<div class="px-4 py-5 sm:px-6">
							<h3
								class="text-lg font-medium leading-6 text-gray-900"
							>
								NFT Information
							</h3>
							<p class="mt-1 max-w-2xl text-sm text-gray-500">
								Personal details and application.
							</p>
						</div>
						<div class="border-t border-gray-200">
							<dl>
								<div
									class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
								>
									<dt
										class="text-sm font-medium text-gray-500"
									>
										Creators
									</dt>
									<dd
										class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0"
									>
										<p
											v-for="creator of nft.creators"
											:key="creator.address.toBase58()"
										>
											<hash-link
												:hash="
													creator.address.toBase58()
												"
											/>
											({{ creator.share }}%)
										</p>
									</dd>
								</div>
								<div
									class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
								>
									<dt
										class="text-sm font-medium text-gray-500"
									>
										Mint address
									</dt>
									<dd
										class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0"
									>
										<hash-link
											:hash="nft.mint.address.toBase58()"
										/>
									</dd>
								</div>
							</dl>
						</div>
					</div>
					<div class="flex" v-if="!isCreator">
						<div class="w-full max-w-xs">
							<form class="pt-6 pb-8 mb-4">
								<div class="mb-4">
									<label
										class="block text-gray-700 text-sm font-bold mb-2"
										for="price"
									>
										Price in SOL
									</label>
									<input
										class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
										:class="{
											'border-red-500': !validPrice,
										}"
										id="price"
										type="number"
										placeholder="Price in SOL"
										v-model="price"
									/>
									<p
										v-if="!validPrice"
										class="text-red-500 text-xs italic"
									>
										Please enter a price.
									</p>
								</div>
								<div class="mb-4">
									<label
										class="block text-gray-700 text-sm font-bold mb-2"
										for="uri"
									>
										Link to IPFS containing license
										arguments
									</label>
									<input
										class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
										:class="{
											'border-red-500': !validUri,
										}"
										id="uri"
										type="text"
										placeholder="IPFS uri"
										v-model="offerUri"
									/>
									<p
										v-if="!validUri"
										class="text-red-500 text-xs italic"
									>
										Please enter a valid link.
									</p>
								</div>
							</form>
						</div>
					</div>
					<div class="flex">
						<button
							class="flex ml-auto text-white bg-blue-500 border-0 py-2 px-6 focus:outline-none hover:bg-red-600 rounded"
							v-if="!isCreator"
							@click="initAndMakeOffer"
						>
							Make offer
						</button>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>
