export const dateFromTimestamp = (timestamp) => {
	return new Date(Number(timestamp) * 1000).toLocaleDateString("de-DE");
};

export const pastDateFromTimeStamp = (timestamp) => {
	const daysAgo = (
		(new Date() - new Date(Number(timestamp) * 1000)) /
		(1000 * 60 * 60 * 24)
	).toFixed();
	if (daysAgo == 0) return "Today";
	return `${daysAgo} days ago`;
};
