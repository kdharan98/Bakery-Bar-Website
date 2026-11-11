const ORDERS_STORAGE_KEY = "bakery-bar-orders";

function isOrderRecord(value) {
	return value
		&& typeof value === "object"
		&& !Array.isArray(value)
		&& typeof value.id === "string"
		&& value.id.trim().length > 0
		&& typeof value.username === "string"
		&& value.username.trim().length > 0
		&& typeof value.createdAt === "string"
		&& Number.isFinite(Date.parse(value.createdAt))
		&& Array.isArray(value.items)
		&& value.items.length > 0
		&& value.items.every((item) => (
			item
			&& typeof item === "object"
			&& typeof item.productId === "string"
			&& typeof item.name === "string"
			&& typeof item.image === "string"
			&& Number.isSafeInteger(item.quantity)
			&& item.quantity > 0
			&& Number.isFinite(item.unitPrice)
			&& item.unitPrice >= 0
			&& Number.isFinite(item.itemSubtotal)
			&& item.itemSubtotal >= 0
		))
		&& Number.isFinite(value.subtotal)
		&& value.subtotal >= 0
		&& (value.deliveryFee === null || (Number.isFinite(value.deliveryFee) && value.deliveryFee >= 0))
		&& Number.isFinite(value.total)
		&& value.total >= 0
		&& typeof value.status === "string"
		&& value.status.trim().length > 0;
}

function readStoredOrders() {
	if (typeof window === "undefined") {
		return [];
	}

	const storedOrders = window.localStorage.getItem(ORDERS_STORAGE_KEY);
	if (!storedOrders) {
		return [];
	}

	const parsedOrders = JSON.parse(storedOrders);
	if (!Array.isArray(parsedOrders)) {
		throw new TypeError("Saved order data is not an array.");
	}

	const validOrders = parsedOrders.filter(isOrderRecord);
	if (validOrders.length !== parsedOrders.length) {
		console.warn("Invalid entries were discarded from saved orders.");
	}

	return validOrders;
}

function generateOrderId(existingOrders) {
	const cryptoApi = globalThis.crypto;
	let orderId;

	do {
		const randomBytes = new Uint8Array(16);
		if (cryptoApi?.getRandomValues) {
			cryptoApi.getRandomValues(randomBytes);
		} else {
			randomBytes.forEach((_, index) => {
				randomBytes[index] = Math.floor(Math.random() * 256);
			});
		}

		const randomPart = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
		orderId = `BB-${Date.now().toString(36).toUpperCase()}-${randomPart.toUpperCase()}`;
	} while (existingOrders.some((order) => order.id === orderId));

	return orderId;
}

export function getOrdersForUser(username) {
	if (typeof username !== "string" || !username.trim()) {
		return [];
	}

	const normalizedUsername = username.trim().toLowerCase();
	return readStoredOrders()
		.map((order, index) => ({ order, index }))
		.filter(({ order }) => order.username.trim().toLowerCase() === normalizedUsername)
		.sort((first, second) => (
			Date.parse(second.order.createdAt) - Date.parse(first.order.createdAt)
			|| second.index - first.index
		))
		.map(({ order }) => order);
}

export function saveOrder(order) {
	try {
		const existingOrders = readStoredOrders();
		const savedOrder = {
			...order,
			id: generateOrderId(existingOrders),
		};
		window.localStorage.setItem(
			ORDERS_STORAGE_KEY,
			JSON.stringify([...existingOrders, savedOrder]),
		);
		return savedOrder;
	} catch (error) {
		console.error("Could not save the order.", error);
		throw new Error("We couldn't save your order. Please try again.");
	}
}
