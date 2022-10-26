import { createStore } from "vuex";
// import { toRaw } from "vue";

// Create a new store instance.
export default createStore({
	state: {
		nfts: [],
	},
	getters: {
		allNfts: (state) => {
			return state.nfts;
		},
		findNftByMint: (state) => (mint) => {
			return state.nfts.find(
				(nft) => nft.mint.address.toBase58() === mint
			);
		},
	},
	mutations: {
		/**
		 * Initializes the states data
		 */
		set(state, data) {
			state.nfts = data.nfts;
		},

		setImgDataForNft(state, { mint, uri }) {
			state.nfts = state.nfts.map((nft) => {
				if (nft.mint.address.toBase58() !== mint) return nft;
				return { ...nft, imageUri: uri };
			});
		},
	},
});
