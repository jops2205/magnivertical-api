export const calculateNetValue = (
	totalValue: number,
	percentageDiscount: number,
) => {
	const netValue =
		totalValue > 0
			? Math.round((totalValue * (100 - percentageDiscount)) / 100)
			: 0;

	return netValue;
};
