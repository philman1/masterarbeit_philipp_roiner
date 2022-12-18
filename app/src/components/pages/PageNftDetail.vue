<script setup>
import { ref, defineProps, onMounted } from "vue";
import { web3 } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import store from "@/store";
import {
	fetchNft,
	initializeOffer,
	makeOffer,
	fetchImages,
	fetchLicenses,
	mintAddressFilter,
	updateImageAvailability,
	updateImageAllowedLicenseTypes,
	updateImageOneTimePrice,
	downloadDecryptedImage,
	buyRfLicense,
	licenseOwnerFilter,
	createLicense,
} from "@/api";
import { useWorkspace, today } from "@/composables";
import HashLink from "../basic/HashLink.vue";
import SimpleButton from "../basic/SimpleButton.vue";
import DuoHeadline from "../basic/DuoHeadline.vue";

const { wallet } = useWorkspace();

const props = defineProps({
	mint: String,
});

const nft = ref(null);
const image = ref(null);
const license = ref(null);
const mint_pk = ref(null);
const isCreator = ref(false);
const whitelistAccount = ref("");
const whitelistAccountValidUntil = ref("");
const whitelistAccountLicenseInformation = ref("");

const licenseType = ref(null);
const oneTimePrice = ref(null);

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

	isCreator.value = nft.value.creators.some(
		(creator) =>
			wallet.value.publicKey.toBase58() === creator.address.toBase58()
	);

	await fetchImageAccount();
	await fetchLicense();
});

const fetchImageAccount = async () => {
	const img = await fetchImages([
		mintAddressFilter(nft.value.mint.address.toBase58()),
	]);
	if (img.length > 0) {
		image.value = img[0];
		licenseType.value = image.value.allowedLicenseTypesAsNumber;
		oneTimePrice.value = image.value.oneTimePriceNumber;
	}
};

const fetchLicense = async () => {
	const l = await fetchLicenses([
		licenseOwnerFilter(wallet.value.publicKey.toBase58()),
	]);
	if (l.length > 0) {
		license.value = l[0];
	}
};

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
		new web3.PublicKey(nft.value.creators[0].address),
		offerUri.value
	).then(async () => {
		await makeOffer(price.value, mint_pk.value).then(() => {
			console.log("success");
		});
	});
};

const switchAvailability = async () => {
	await updateImageAvailability(
		image.value.mintAddress,
		!image.value.available
	).then(async () => {
		await fetchImageAccount();
	});
};

const changeAllowedLicenseTypes = async () => {
	await updateImageAllowedLicenseTypes(
		image.value.mintAddress,
		licenseType.value
	).then(async () => {
		await fetchImageAccount();
	});
};

const updatePrice = async () => {
	await updateImageOneTimePrice(
		image.value.mintAddress,
		oneTimePrice.value
	).then(async () => {
		await fetchImageAccount();
	});
};

const buyLicense = async () => {
	await buyRfLicense(image.value.mintAddress, image.value.author);
};

const downloadImage = async () => {
	await downloadDecryptedImage(nft.value.mint.address);
};

const provideAccess = async () => {
	if (
		!whitelistAccount.value ||
		!whitelistAccountLicenseInformation.value ||
		!whitelistAccountValidUntil.value
	) {
		alert("Missing fields");
		return;
	}

	console.log(whitelistAccountValidUntil.value);

	await createLicense(
		new PublicKey(whitelistAccount.value),
		image.value.mintAddress,
		new Date(whitelistAccountValidUntil.value),
		whitelistAccountLicenseInformation.value
	);
};
</script>

<template>
	<section class="text-gray-700 body-font overflow-hidden bg-white">
		<div v-if="nft" class="container lg:w-4/5 px-5 py-4 mx-auto">
			<duo-headline
				importance="1"
				:headline="nft.json.name"
				:sub-headline="nft.json.description"
				class="!px-0"
			></duo-headline>
			<div class="mx-auto flex flex-wrap">
				<img
					alt="ecommerce"
					class="lg:w-1/2 w-full object-cover object-center rounded border border-gray-200"
					:src="nft.imageUri"
				/>
				<div class="lg:w-1/2 w-full lg:pl-10 mt-6 lg:mt-0">
					<div
						class="overflow-hidden bg-white shadow sm:rounded-lg mb-6"
					>
						<div class="px-4 py-5 sm:px-6">
							<h3
								class="text-lg font-medium leading-6 text-gray-900"
							>
								NFT Information
							</h3>
							<p class="mt-1 max-w-2xl text-sm text-gray-500">
								Details about the NFT and licensing.
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
								<div v-if="image">
									<div
										class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
									>
										<dt
											class="text-sm font-medium text-gray-500"
										>
											Upload date
										</dt>
										<dd
											class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0"
										>
											{{ image.createdAt }}
										</dd>
									</div>
									<div
										class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
									>
										<dt
											class="text-sm font-medium text-gray-500"
										>
											Availability
										</dt>
										<dd
											class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0"
										>
											<div class="flex items-start">
												<span class="w-24 mr-3">{{
													image.availability
												}}</span>
												<simple-button
													v-if="isCreator"
													:click-handler="
														switchAvailability
													"
													:label="`Set to ${
														image.available
															? 'Private'
															: 'Public'
													}`"
													appearance="secondary"
												/>
											</div>
										</dd>
									</div>
									<div
										class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
										v-if="image.available"
									>
										<dt
											class="text-sm font-medium text-gray-500"
										>
											Allowed license types
										</dt>
										<dd
											class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0"
										>
											<div class="flex items-baseline">
												<input
													class="appearance-none border rounded w-24 py-2 px-3 text-gray-700 mr-3 mb-3 focus:border focus:border-gray-500 focus-visible:outline-none focus:shadow-outline"
													type="number"
													v-model="licenseType"
													min="0"
													max="3"
													step="1"
													:readonly="
														isCreator ? false : true
													"
												/>
												<simple-button
													v-if="isCreator"
													:click-handler="
														changeAllowedLicenseTypes
													"
													label="Switch"
													appearance="secondary"
												/>
											</div>
											<div>
												<p
													class="mt-1 max-w-2xl text-sm text-gray-500"
												>
													0 - Public Domain
												</p>
												<p
													class="mt-1 max-w-2xl text-sm text-gray-500"
												>
													1 - Creative Commons (CC)
												</p>
												<p
													class="mt-1 max-w-2xl text-sm text-gray-500"
												>
													2 - Royalty Free (RF)
												</p>
												<p
													class="mt-1 max-w-2xl text-sm text-gray-500"
												>
													3 - Rights Managed (RM)
												</p>
											</div>
										</dd>
									</div>
									<div
										class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
									>
										<dt
											class="text-sm font-medium text-gray-500"
										>
											Price (SOL)
										</dt>
										<dd
											class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0"
										>
											<div class="flex items-start">
												<input
													class="appearance-none border rounded w-24 py-2 px-3 text-gray-700 mr-3 mb-3 focus:border focus:border-gray-500 focus-visible:outline-none focus:shadow-outline"
													type="number"
													v-model="oneTimePrice"
													min="0"
													max="3"
													step="1"
													:readonly="
														isCreator ? false : true
													"
												/>
												<simple-button
													v-if="isCreator"
													:click-handler="updatePrice"
													label="Update price"
													appearance="secondary"
												/>
											</div>
										</dd>
									</div>
								</div>
							</dl>
						</div>
					</div>
					<div
						v-if="
							!isCreator &&
							image &&
							(image.allowedLicenseTypesAsNumber === 0 ||
								image.allowedLicenseTypesAsNumber === 1)
						"
					>
						<simple-button
							:click-handler="downloadImage"
							label="Download"
						/>
					</div>
				</div>
				<div v-if="!isCreator && !license">
					<div v-if="image && image.allowedLicenseTypesAsNumber == 2">
						<duo-headline
							importance="3"
							headline="Buy license"
							class="!px-0 mt-4"
						></duo-headline>
						<div v-if="!isCreator" class="flex items-baseline">
							<p class="text-l text-black-500 mr-4">
								{{ image.oneTimePriceText }}
							</p>
							<simple-button
								:click-handler="buyLicense"
								label="Pay!"
							/>
						</div>
					</div>
					<div v-if="image && image.allowedLicenseTypesAsNumber == 3">
						<duo-headline
							importance="3"
							headline="Make an offer"
							class="!px-0 mt-4"
						></duo-headline>
						<div class="flex">
							<div class="w-full max-w-xs">
								<form class="pt-2">
									<div class="mb-4">
										<label
											class="block text-sm font-medium text-gray-500 mb-2"
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
											class="block text-sm font-medium text-gray-500 mb-2"
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
							<simple-button
								:click-handler="initAndMakeOffer"
								label="Make offer"
							/>
						</div>
					</div>
				</div>
				<div
					v-if="
						!isCreator &&
						license &&
						license.ownerB58 == wallet.publicKey.toBase58()
					"
				>
					<duo-headline
						importance="3"
						headline="Download area"
						sub-headline="You own a valid license."
						class="!px-0 mt-4"
					></duo-headline>
					<div v-if="!isCreator">
						<p class="text-l text-black-500 mb-4">
							License pubKey:
							<hash-link :hash="license.publicKeyB58" />
						</p>
						<simple-button
							:click-handler="downloadImage"
							label="Download image"
						/>
					</div>
				</div>
				<div v-if="isCreator">
					<duo-headline
						importance="3"
						headline="Provide access"
						sub-headline="For someone you have a deal with."
						class="!px-0 mt-4"
					></duo-headline>
					<div class="flex flex-wrap">
						<input
							class="appearance-none border rounded w-full py-2 px-3 text-gray-700 mr-3 mb-3 focus:border focus:border-gray-500 focus-visible:outline-none focus:shadow-outline"
							type="text"
							v-model="whitelistAccount"
							placeholder="Acc. that should receive license"
						/>
						<input
							class="appearance-none border rounded w-full py-2 px-3 text-gray-700 mr-3 mb-3 focus:border focus:border-gray-500 focus-visible:outline-none focus:shadow-outline"
							type="text"
							v-model="whitelistAccountLicenseInformation"
							placeholder="IPFS link to license agreement"
						/>
						<input
							class="appearance-none border rounded w-full py-2 px-3 text-gray-700 mr-3 mb-3 focus:border focus:border-gray-500 focus-visible:outline-none focus:shadow-outline"
							type="date"
							:min="today()"
							v-model="whitelistAccountValidUntil"
							placeholder="Valid until"
						/>
						<simple-button
							v-if="isCreator"
							:click-handler="provideAccess"
							label="Submit"
							appearance="secondary"
						/>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>
