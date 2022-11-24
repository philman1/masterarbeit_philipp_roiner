<script setup>
import { ref } from "vue";
import { WalletMultiButton } from "solana-wallets-vue";
import { useWallet } from "solana-wallets-vue";
import logo from "@/assets/picense_logo_075x.png";

const { connected, publicKey } = useWallet();
let isOpen = ref(false);
</script>

<template>
	<header
		class="bg-black-800 lg:mb-8 sm:flex sm:justify-between sm:items-center sm:px-4 sm:py-3"
	>
		<div class="flex items-center justify-between px-4 py-3 sm:p-0">
			<!-- <div>
				<wallet-multi-button></wallet-multi-button>
			</div> -->
			<img :src="logo" style="width: 50%" />
			<div class="sm:hidden">
				<button
					@click="isOpen = !isOpen"
					type="button"
					class="block text-gray-500 hover:text-white focus:text-white focus:outline-none"
				>
					<svg class="h-6 w-6 fill-current" viewBox="0 0 24 24">
						<path
							v-if="isOpen"
							fill-rule="evenodd"
							d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
						/>
						<path
							v-if="!isOpen"
							fill-rule="evenodd"
							d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
						/>
					</svg>
				</button>
			</div>
		</div>
		<div class="flex items-center justify-between">
			<nav
				:class="isOpen ? 'block' : 'hidden'"
				class="px-2 pt-2 pb-4 sm:flex sm:p-0 mr-4"
				v-if="connected && publicKey != null"
			>
				<router-link
					:to="{ name: 'Home' }"
					class="block px-6 py-3 text-white font-semibold rounded hover:bg-gray-800"
					>Home</router-link
				>
				<router-link
					:to="{ name: 'MintNft' }"
					class="block px-6 py-3 text-white font-semibold rounded hover:bg-gray-800"
					>Mint Nft</router-link
				>
				<router-link
					:to="{ name: 'Offers' }"
					class="block px-6 py-3 text-white font-semibold rounded hover:bg-gray-800"
					>Offers</router-link
				>
				<router-link
					:to="{ name: 'Licenses' }"
					class="block px-6 py-3 text-white font-semibold rounded hover:bg-gray-800"
					>Licenses</router-link
				>
			</nav>

			<wallet-multi-button></wallet-multi-button>
		</div>
	</header>
</template>
