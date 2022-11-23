const sharp = require("sharp");

const createThumbnails = async (files) => {
	return await Promise.all(
		files.map(async (file) => {
			const { width, height } = file.dim;
			const scaledWidth = 200;
			const factor = width / scaledWidth;
			const scalledHeight = Math.round(height / factor);

			return {
				name: file.name,
				buff: await sharp(file.buff)
					.resize(scaledWidth, scalledHeight)
					.png()
					.toBuffer(),
			};
		})
	);
};

module.exports = {
	createThumbnails: createThumbnails,
};
