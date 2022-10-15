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
];
