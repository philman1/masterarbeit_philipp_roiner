const webpack = require("webpack");
const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
	transpileDependencies: true,
	configureWebpack: {
		plugins: [
			new webpack.ProvidePlugin({
				Buffer: ["buffer", "Buffer"],
			}),
		],
		resolve: {
			fallback: {
				crypto: false,
				fs: false,
				assert: false,
				process: false,
				util: false,
				path: false,
				stream: false,
				zlib: false,
			},
		},
	},
	devServer: {
		proxy: "http://127.0.0.1:5001/",
		port: 8081,
	},
});
