<template>
	<nav-bar />
	<div v-if="connected && publicKey != null">
		<router-view></router-view>
	</div>
</template>

<script setup>
import { initWorkspace } from "@/composables";
import NavBar from "./components/NavBar.vue";

import {
	PhantomWalletAdapter,
	SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { initWallet, useWallet } from "solana-wallets-vue";

const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

initWallet({ wallets, autoConnect: true });
initWorkspace();

const { connected, publicKey } = useWallet();
</script>
