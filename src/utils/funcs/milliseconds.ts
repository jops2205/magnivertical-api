export const seconds = (seconds: number) => {
	return seconds * 1000;
};

export const minutes = (minutes: number) => {
	return 60 * minutes * seconds(1);
};

export const hours = (hours: number) => {
	return 60 * hours * minutes(1);
};

export const days = (days: number) => {
	return 24 * days * hours(1);
};
