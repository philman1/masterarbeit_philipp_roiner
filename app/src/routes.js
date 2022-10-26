export default [
	{
		name: "Home",
		path: "/",
		component: require("@/components/PageHome").default,
	},
	{
		name: "MintNft",
		path: "/mint/nft",
		component: require("@/components/PageMintNft").default,
	},
	{
		name: "NftDetail",
		path: "/nft/:mint/details",
		component: require("@/components/PageNftDetail").default,
		props: true,
	},
];
