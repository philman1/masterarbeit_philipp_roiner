export default [
	{
		name: "Home",
		path: "/",
		component: require("@/components/pages/PageHome").default,
	},
	{
		name: "MintNft",
		path: "/mint/nft",
		component: require("@/components/pages/PageMintNft").default,
	},
	{
		name: "NftDetail",
		path: "/nft/:mint/details",
		component: require("@/components/pages/PageNftDetail").default,
		props: true,
	},
	{
		name: "Offers",
		path: "/offers/",
		component: require("@/components/pages/PageOffers").default,
	},
	{
		name: "Licenses",
		path: "/licenses/",
		component: require("@/components/pages/PageLicenses").default,
	},
	{
		name: "Profile",
		path: "/profile",
		component: require("@/components/pages/PageProfile").default,
	},
];
