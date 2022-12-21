/**
 * Returns the current date in the format YYYY-MM-DD.
 * @returns A string in the format of YYYY-MM-DD
 */
export const today = () => {
	return new Date().toISOString().split("T")[0];
};

/**
 * Returns a date string for a given timestamp
 * @param timestamp - The timestamp to convert to a date string.
 * @returns A date string in the format "dd.mm.yyyy"
 */
export const dateFromTimestamp = (timestamp) => {
	return new Date(Number(timestamp) * 1000).toLocaleDateString("de-DE");
};

/**
 * Takes a timestamp and returns a string that says how many days ago that timestamp was
 * @param timestamp - Input timestamp.
 * @returns A string that says "Today" or "X days ago"
 */
export const pastDateFromTimeStamp = (timestamp) => {
	const daysAgo = (
		(new Date() - new Date(Number(timestamp) * 1000)) /
		(1000 * 60 * 60 * 24)
	).toFixed();
	if (daysAgo == 0) return "Today";
	return `${daysAgo} days ago`;
};
