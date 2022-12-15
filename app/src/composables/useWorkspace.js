import { computed } from "vue";
import { useAnchorWallet, useWallet } from "solana-wallets-vue";
import {
	Metaplex,
	keypairIdentity,
	bundlrStorage,
} from "@metaplex-foundation/js";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, AnchorProvider } from "@project-serum/anchor";
import idl from "../idl.json";

const clusterUrl = process.env.VUE_APP_CLUSTER_URL;
const preflightCommitment = "processed";
const commitment = "processed";
const programID = new PublicKey(idl.metadata.address);
let workspace = null;
let metaplex = null;

export const useWorkspace = () => workspace;

export const useMetaplex = () => {
	return { metaplex };
};

export const initWorkspace = () => {
	const wallet = useAnchorWallet();
	const connection = new Connection(clusterUrl, commitment);
	const provider = computed(
		() =>
			new AnchorProvider(connection, wallet.value, {
				preflightCommitment,
				commitment,
			})
	);
	const program = computed(() => new Program(idl, programID, provider.value));

	workspace = {
		wallet,
		connection,
		provider,
		program,
	};
};

export const initMetaplex = () => {
	const connection = new Connection(clusterApiUrl("devnet"));
	// const connection = new Connection("http://127.0.0.1:8899");
	const { wallet } = useWallet();

	metaplex = Metaplex.make(connection)
		.use(keypairIdentity(wallet))
		.use(bundlrStorage());
};
