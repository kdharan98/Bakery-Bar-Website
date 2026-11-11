const currencyFormatter = new Intl.NumberFormat("en-IN", {
	style: "currency",
	currency: "INR",
	maximumFractionDigits: 0,
});

function formatCurrency(amount) {
	return currencyFormatter.format(amount);
}

export default formatCurrency;