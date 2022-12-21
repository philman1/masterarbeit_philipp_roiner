import sharp from "sharp";

/**
 * Takes an array of files, and returns an array of thumbnails
 * @param files - Files
 * @returns Array of Objects that contain a name and the buffer of the thumbnail.
 */
export const createThumbnails = async (files) => {
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
