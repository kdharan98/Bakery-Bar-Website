import deliveryAvailability from "../data/deliveryAvailability.js";

export function validatePinCode(pinCode) {
	if (!/^\d{6}$/.test(pinCode)) {
		return { valid: false, message: "Enter a valid 6-digit PIN code using numbers only." };
	}

	return { valid: true, message: "" };
}

export function checkDeliveryAvailability(pinCode) {
	const validation = validatePinCode(pinCode);
	if (!validation.valid) {
		return { ...validation, status: "invalid" };
	}

	const delivery = deliveryAvailability[pinCode];
	if (!delivery) {
		return {
			...validation,
			status: "unavailable",
			available: false,
			pinCode,
			message: "Sorry! We don't deliver to this PIN code yet.",
		};
	}

	return {
		...validation,
		status: "available",
		available: true,
		pinCode,
		eta: delivery.eta,
	};
}
