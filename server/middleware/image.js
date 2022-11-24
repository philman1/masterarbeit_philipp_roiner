const sharp = require("sharp");

const createThumbnails = async (files) => {
	return await Promise.all(
		files.map(async (file) => {
			// Create thumbnail:
			// Resize original image to a long edge size of 360px
			const { width, height } = file.dim;
			const longEdge = 720;
			const factor = Math.max(width, height) / longEdge;
			const shortEdge = Math.round(Math.min(width, height) / factor);
			const ratio = width / height;

			let scaledWidth = longEdge,
				scaledHeight = shortEdge;
			if (ratio < 1) {
				scaledWidth = shortEdge;
				scaledHeight = longEdge;
			}

			return {
				name: file.name,
				buff: await sharp(file.buff)
					.resize(scaledWidth, scaledHeight)
					.png()
					.toBuffer(),
			};
		})
	);
};

module.exports = {
	createThumbnails: createThumbnails,
};
