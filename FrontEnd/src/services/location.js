export function getCurrentCoordinates() {
	return new Promise((resolve, reject) => {
		if (!navigator.geolocation) {
			reject(new Error("Location services are not supported by this browser."));
			return;
		}

		navigator.geolocation.getCurrentPosition(
			({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
			reject,
			{ enableHighAccuracy: false, timeout: 10000, maximumAge: 0 },
		);
	});
}

export function getLocationErrorMessage(error) {
	if (error.code === 1) {
		return "Location permission was denied. You can still enter your address manually.";
	}
	if (error.code === 2) {
		return "Your location is unavailable right now. Please enter your address manually.";
	}
	if (error.code === 3) {
		return "Finding your location timed out. Please try again or enter your address manually.";
	}
	return error.message || "We couldn't detect your location. Please enter your address manually.";
}
