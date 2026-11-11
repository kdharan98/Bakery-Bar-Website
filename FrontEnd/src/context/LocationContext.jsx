import { createContext, useContext, useEffect, useState } from "react";
import { checkDeliveryAvailability } from "../utils/deliveryAvailability.js";

const STORAGE_KEY = "bakery-bar-delivery-location";
const LocationContext = createContext(null);

function readSelectedLocation() {
	if (typeof window === "undefined") {
		return null;
	}

	try {
		const storedLocation = window.localStorage.getItem(STORAGE_KEY);
		if (!storedLocation) {
			return null;
		}

		const parsedLocation = JSON.parse(storedLocation);
		if (!parsedLocation || typeof parsedLocation.pinCode !== "string") {
			console.warn("Invalid saved delivery location data was discarded.");
			return null;
		}

		const availability = checkDeliveryAvailability(parsedLocation.pinCode);
		if (!availability.available) {
			console.warn("The saved delivery PIN code is no longer available.");
			return null;
		}

		return {
			pinCode: availability.pinCode,
			available: true,
			eta: availability.eta,
		};
	} catch (error) {
		console.error("Could not read saved delivery location.", error);
		return null;
	}
}

function saveSelectedLocation(selectedLocation) {
	try {
		if (selectedLocation) {
			window.localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({ pinCode: selectedLocation.pinCode }),
			);
		} else {
			window.localStorage.removeItem(STORAGE_KEY);
		}
	} catch (error) {
		console.error("Could not save delivery location.", error);
	}
}

export function LocationProvider({ children }) {
	const [selectedLocation, setSelectedLocation] = useState(readSelectedLocation);
	const [locationSelectorOpen, setLocationSelectorOpen] = useState(false);

	useEffect(() => {
		saveSelectedLocation(selectedLocation);
	}, [selectedLocation]);

	function openLocationSelector() {
		setLocationSelectorOpen(true);
	}

	function closeLocationSelector() {
		setLocationSelectorOpen(false);
	}

	function confirmLocation(pinCode) {
		const availability = checkDeliveryAvailability(pinCode);
		if (!availability.available) {
			return availability;
		}

		const selection = {
			pinCode: availability.pinCode,
			available: true,
			eta: availability.eta,
		};
		setSelectedLocation(selection);
		return availability;
	}

	function clearLocation() {
		setSelectedLocation(null);
	}

	return (
		<LocationContext.Provider
			value={{
				selectedLocation,
				confirmLocation,
				clearLocation,
				locationSelectorOpen,
				openLocationSelector,
				closeLocationSelector,
			}}
		>
			{children}
		</LocationContext.Provider>
	);
}

export function useLocationSelection() {
	const context = useContext(LocationContext);
	if (!context) {
		throw new Error("useLocationSelection must be used within a LocationProvider");
	}

	return context;
}
