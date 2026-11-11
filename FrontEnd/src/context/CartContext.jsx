import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const CART_STORAGE_KEY = "bakery-bar-cart";

function getSelectedOptionsKey(item) {
	const selectedOptions = item.selectedOptions;
	if (!selectedOptions || typeof selectedOptions !== "object" || Array.isArray(selectedOptions)) {
		return "";
	}

	return JSON.stringify(Object.entries(selectedOptions).sort(([first], [second]) => first.localeCompare(second)));
}

function isSameCartConfiguration(cartItem, item) {
	return cartItem.id === item.id && getSelectedOptionsKey(cartItem) === getSelectedOptionsKey(item);
}

function readCartItems() {
	if (typeof window === "undefined") {
		return [];
	}

	try {
		const storedItems = window.localStorage.getItem(CART_STORAGE_KEY);
		if (!storedItems) {
			return [];
		}

		const parsedItems = JSON.parse(storedItems);
		if (!Array.isArray(parsedItems)) {
			console.error("Saved cart data is not an array.");
			return [];
		}

		const validItems = parsedItems.filter((item) => (
			item
			&& typeof item === "object"
			&& !Array.isArray(item)
			&& typeof item.id === "string"
			&& item.id.trim().length > 0
		));
		if (validItems.length !== parsedItems.length) {
			console.warn("Invalid entries were discarded from saved cart data.");
		}

		return validItems.map((item) => {
			const quantity = Number(item.quantity);
			return {
				...item,
				quantity: Number.isSafeInteger(quantity) && quantity > 0 ? quantity : 1,
			};
		});
	} catch (error) {
		console.error("Could not read saved cart data.", error);
		return [];
	}
}

function saveCartItems(cartItems) {
	try {
		if (!cartItems.length) {
			window.localStorage.removeItem(CART_STORAGE_KEY);
			return;
		}

		window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
	} catch (error) {
		console.error("Could not save cart data.", error);
	}
}

export function CartProvider({ children }) {
	const [cartItems, setCartItems] = useState(readCartItems);

	useEffect(() => {
		saveCartItems(cartItems);
	}, [cartItems]);

	const cartCount = cartItems.reduce((total, item) => {
		const quantity = Number(item.quantity);
		return total + (Number.isFinite(quantity) && quantity > 0 ? quantity : 1);
	}, 0);

	function addToCart(item) {
		const quantity = Number(item.quantity);
		const quantityToAdd = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
		setCartItems((currentItems) => {
			const matchingItems = currentItems.filter((cartItem) => isSameCartConfiguration(cartItem, item));
			if (!matchingItems.length) {
				return [...currentItems, { ...item, quantity: quantityToAdd }];
			}

			const existingQuantity = matchingItems.reduce((total, cartItem) => {
				const storedQuantity = Number(cartItem.quantity);
				return total + (Number.isFinite(storedQuantity) && storedQuantity > 0 ? storedQuantity : 1);
			}, 0);
			let mergedItem = false;

			return currentItems.reduce((updatedItems, cartItem) => {
				if (!isSameCartConfiguration(cartItem, item)) {
					updatedItems.push(cartItem);
				} else if (!mergedItem) {
					updatedItems.push({
						...cartItem,
						quantity: existingQuantity + quantityToAdd,
					});
					mergedItem = true;
				}
				return updatedItems;
			}, []);
		});
	}

	function updateCartItemQuantity(item, quantity) {
		const nextQuantity = Number(quantity);
		if (!Number.isSafeInteger(nextQuantity) || nextQuantity < 1) {
			throw new RangeError("Cart item quantity must be a positive integer.");
		}

		setCartItems((currentItems) => currentItems.map((cartItem) => (
			isSameCartConfiguration(cartItem, item)
				? { ...cartItem, quantity: nextQuantity }
				: cartItem
		)));
	}

	function removeCartItem(item) {
		setCartItems((currentItems) => currentItems.filter(
			(cartItem) => !isSameCartConfiguration(cartItem, item),
		));
	}

	function clearCart() {
		setCartItems([]);
	}

	const value = {
		cartItems,
		cartCount,
		addToCart,
		updateCartItemQuantity,
		removeCartItem,
		clearCart,
		setCartItems,
	};

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
}