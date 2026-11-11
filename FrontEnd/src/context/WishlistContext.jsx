import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext(null);
const STORAGE_KEY = "bakery-bar-wishlist";

function readWishlist() {
	if (typeof window === "undefined") {
		return [];
	}

	try {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		const parsed = stored ? JSON.parse(stored) : [];
		return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
	} catch {
		return [];
	}
}

export function WishlistProvider({ children }) {
	const [wishlistIds, setWishlistIds] = useState(readWishlist);

	useEffect(() => {
		try {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistIds));
		} catch {}
	}, [wishlistIds]);

	function toggleWishlist(productId) {
		setWishlistIds((currentIds) => currentIds.includes(productId)
			? currentIds.filter((id) => id !== productId)
			: [...currentIds, productId]);
	}

	return (
		<WishlistContext.Provider value={{ wishlistIds, isWishlisted: (id) => wishlistIds.includes(id), toggleWishlist }}>
			{children}
		</WishlistContext.Provider>
	);
}

export function useWishlist() {
	const context = useContext(WishlistContext);
	if (!context) {
		throw new Error("useWishlist must be used within a WishlistProvider");
	}
	return context;
}