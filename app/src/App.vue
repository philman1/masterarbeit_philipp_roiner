<template>
	<div class="w-screen h-screen">
		<nav-bar />
		<div v-if="connected && publicKey != null" class="md:container md:mx-auto">
			<router-view class=""></router-view>
		</div>
	</div>
</template>

<script setup>
import { initMetaplex, initWorkspace } from "@/composables";
import NavBar from "./components/NavBar.vue";

import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { initWallet, useWallet } from "solana-wallets-vue";

const wallets = [new PhantomWalletAdapter()];

initWallet({ wallets, autoConnect: true });
initWorkspace();
initMetaplex();

const { connected, publicKey } = useWallet();
</script>
