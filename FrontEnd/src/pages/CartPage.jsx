import { useRef, useState } from "react";
import {
	CheckCircle2,
	MapPin,
	Minus,
	Plus,
	ShoppingBag,
	Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button.jsx";
import Modal from "../components/common/Modal.jsx";
import categories from "../data/categories.js";
import products from "../data/products.js";
import { useCart } from "../context/CartContext.jsx";
import { useLocationSelection } from "../context/LocationContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { saveOrder } from "../services/orders.js";
import formatCurrency from "../utils/formatCurrency.js";

function getQuantity(item) {
	const quantity = Number(item.quantity);
	return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

function getOptionsLabel(selectedOptions) {
	if (!selectedOptions || typeof selectedOptions !== "object" || Array.isArray(selectedOptions)) {
		return "";
	}

	return Object.entries(selectedOptions)
		.map(([name, value]) => `${name}: ${String(value)}`)
		.join(", ");
}

function CartPage() {
	const {
		cartItems,
		cartCount,
		clearCart,
		removeCartItem,
		updateCartItemQuantity,
	} = useCart();
	const { selectedLocation, openLocationSelector } = useLocationSelection();
	const { user } = useAuth();
	const navigate = useNavigate();
	const [orderDialog, setOrderDialog] = useState(null);
	const [orderSummary, setOrderSummary] = useState(null);
	const [orderError, setOrderError] = useState("");
	const [successEntered, setSuccessEntered] = useState(false);
	const orderInProgressRef = useRef(false);
	const cartLines = cartItems.map((cartItem) => {
		const product = products.find((item) => item.id === cartItem.id);
		const category = categories.find((item) => item.slug === product?.category);
		const storedPrice = Number(cartItem.price);
		const hasStoredPrice = cartItem.price !== undefined
			&& cartItem.price !== null
			&& cartItem.price !== "";

		return {
			cartItem,
			id: cartItem.id,
			name: cartItem.name || product?.name || "Bakery product",
			category: category?.name ?? product?.category ?? "",
			image: cartItem.image || product?.image || "",
			price: hasStoredPrice && Number.isFinite(storedPrice) && storedPrice >= 0
				? storedPrice
				: Number(product?.price ?? 0),
			quantity: getQuantity(cartItem),
			selectedOptions: cartItem.selectedOptions,
			optionsLabel: getOptionsLabel(cartItem.selectedOptions),
		};
	});
	const itemSubtotal = cartLines.reduce((total, item) => total + item.price * item.quantity, 0);
	const deliveryFee = typeof selectedLocation?.deliveryFee === "number"
		&& Number.isFinite(selectedLocation.deliveryFee)
		&& selectedLocation.deliveryFee >= 0
		? selectedLocation.deliveryFee
		: null;
	const total = itemSubtotal + (deliveryFee ?? 0);
	const deliveryEstimate = selectedLocation?.eta
		? `Delivery in ${selectedLocation.eta.replace(" minutes", " min")}`
		: "";

	function handlePlaceOrder() {
		if (cartItems.length > 0 && !orderInProgressRef.current) {
			setOrderError("");
			setOrderDialog("confirm");
		}
	}

	function handleConfirmOrder() {
		if (cartItems.length === 0 || orderInProgressRef.current) {
			return;
		}

		if (!user?.username) {
			setOrderError("Please sign in before placing your order.");
			return;
		}

		orderInProgressRef.current = true;
		try {
			saveOrder({
				username: user.username,
				createdAt: new Date().toISOString(),
				items: cartLines.map((item) => ({
					productId: item.id,
					name: item.name,
					category: item.category,
					image: item.image,
					selectedOptions: item.selectedOptions ?? null,
					optionsLabel: item.optionsLabel,
					quantity: item.quantity,
					unitPrice: item.price,
					itemSubtotal: item.price * item.quantity,
				})),
				subtotal: itemSubtotal,
				deliveryFee,
				total,
				deliveryLocation: selectedLocation
					? { pinCode: selectedLocation.pinCode }
					: null,
				deliveryEstimate: deliveryEstimate || null,
				status: "Order Placed",
			});
		} catch (error) {
			orderInProgressRef.current = false;
			setOrderError(error instanceof Error ? error.message : "We couldn't save your order. Please try again.");
			return;
		}

		setOrderError("");
		setOrderSummary({
			items: cartLines.map((item) => ({
				id: item.id,
				name: item.name,
				quantity: item.quantity,
				price: item.price,
				optionsLabel: item.optionsLabel,
			})),
			total,
			deliveryEstimate,
		});
		clearCart();
		setOrderDialog("success");
		setSuccessEntered(false);
		window.requestAnimationFrame(() => setSuccessEntered(true));
	}

	function handleDialogClose() {
		if (orderDialog === "success") {
			orderInProgressRef.current = false;
			setOrderSummary(null);
		}
		setOrderError("");
		setSuccessEntered(false);
		setOrderDialog(null);
	}

	function handleContinueShopping() {
		handleDialogClose();
		navigate("/products");
	}

	return (
		<section className="min-w-0 bg-cream py-8 sm:py-12">
			<div className="bb-container min-w-0">
				<div className="mb-8 grid gap-2 sm:mb-10">
					<p className="text-xs font-bold uppercase tracking-[0.16em] text-burgundy">Your Bakery Bar order</p>
					<h1 className="font-heading text-4xl font-semibold leading-tight text-chocolate sm:text-5xl">
						Your Shopping Bag
					</h1>
					<p className="max-w-2xl text-base leading-7 text-muted">
						A few delicious things, ready for your table.
					</p>
				</div>

				{cartItems.length === 0 ? (
					<div className="mx-auto grid max-w-2xl justify-items-center gap-4 rounded-card border border-border bg-white px-6 py-12 text-center shadow-[var(--shadow-card)] sm:px-10 sm:py-16">
						<div className="inline-flex size-20 items-center justify-center rounded-pill bg-cream-secondary text-burgundy">
							<ShoppingBag aria-hidden="true" size={34} strokeWidth={1.5} />
						</div>
						<h2 className="font-heading text-3xl font-semibold text-chocolate sm:text-4xl">
							Your bag is waiting for something delicious.
						</h2>
						<p className="text-sm leading-6 text-muted">Explore our freshly baked favourites.</p>
						<Button className="mt-2" onClick={() => navigate("/products")} size="lg">
							Explore Products
						</Button>
					</div>
				) : (
					<div className="grid min-w-0 items-start gap-6 desktop:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.8fr)] desktop:gap-8">
						<div aria-label="Cart items" className="grid min-w-0 gap-4">
							{cartLines.map((item, index) => (
								<article
									className="flex min-w-0 gap-3 rounded-card border border-border bg-white p-3 shadow-sm sm:gap-5 sm:p-5"
									key={`${item.id}-${index}`}
								>
									<div className="size-20 shrink-0 overflow-hidden rounded-control bg-cream-secondary sm:size-28">
										{item.image ? (
											<img
												alt={item.name}
												className="h-full w-full object-contain"
												loading="lazy"
												src={item.image}
											/>
										) : (
											<div className="flex h-full items-center justify-center text-burgundy">
												<ShoppingBag aria-hidden="true" size={28} />
											</div>
										)}
									</div>

									<div className="flex min-w-0 flex-1 flex-col gap-3">
										<div className="flex min-w-0 items-start justify-between gap-2">
											<div className="min-w-0">
												{item.category && (
													<p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted">
														{item.category}
													</p>
												)}
												<h2 className="break-words font-heading text-lg font-semibold leading-tight text-chocolate sm:text-xl">
													{item.name}
												</h2>
												{item.optionsLabel && (
													<p className="mt-1 text-xs leading-5 text-muted">{item.optionsLabel}</p>
												)}
											</div>
											<button
												aria-label={`Remove ${item.name} from bag`}
												className="inline-flex size-9 shrink-0 items-center justify-center rounded-pill text-muted transition-colors hover:bg-cream-secondary hover:text-burgundy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
												onClick={() => removeCartItem(item.cartItem)}
												type="button"
											>
												<Trash2 aria-hidden="true" size={17} />
											</button>
										</div>

										<div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-3">
											<div>
												<p className="mb-1 text-xs text-muted">Quantity</p>
												<div
													aria-label={`Quantity for ${item.name}`}
													className="inline-flex h-10 items-center rounded-control border border-border"
												>
													<button
														aria-label={`Decrease ${item.name} quantity`}
														className="inline-flex size-9 items-center justify-center rounded-l-control text-chocolate transition-colors hover:bg-cream-secondary disabled:cursor-not-allowed disabled:opacity-40"
														disabled={item.quantity <= 1}
														onClick={() => updateCartItemQuantity(item.cartItem, item.quantity - 1)}
														type="button"
													>
														<Minus aria-hidden="true" size={15} />
													</button>
													<output aria-live="polite" className="min-w-8 text-center text-sm font-semibold text-chocolate">
														{item.quantity}
													</output>
													<button
														aria-label={`Increase ${item.name} quantity`}
														className="inline-flex size-9 items-center justify-center rounded-r-control text-chocolate transition-colors hover:bg-cream-secondary"
														onClick={() => updateCartItemQuantity(item.cartItem, item.quantity + 1)}
														type="button"
													>
														<Plus aria-hidden="true" size={15} />
													</button>
												</div>
											</div>
											<div className="text-right">
												<p className="text-xs text-muted">{formatCurrency(item.price)} each</p>
												<p className="mt-1 font-semibold text-burgundy">
													{formatCurrency(item.price * item.quantity)}
												</p>
											</div>
										</div>
									</div>
								</article>
							))}
						</div>

						<aside aria-labelledby="order-summary-heading" className="grid min-w-0 gap-5 rounded-card border border-border bg-white p-5 shadow-[var(--shadow-card)] sm:p-7">
							<h2 className="font-heading text-2xl font-semibold text-chocolate" id="order-summary-heading">
								Order Summary
							</h2>

							<div className="grid gap-3 border-b border-border pb-5 text-sm">
								<div className="flex justify-between gap-4 text-muted">
									<span>Items ({cartCount})</span>
									<span>{formatCurrency(itemSubtotal)}</span>
								</div>
								{deliveryFee !== null && (
									<div className="flex justify-between gap-4 text-muted">
										<span>Delivery fee</span>
										<span>{formatCurrency(deliveryFee)}</span>
									</div>
								)}
								<div className="flex justify-between gap-4 font-bold text-chocolate">
									<span>Total</span>
									<span className="text-burgundy">{formatCurrency(total)}</span>
								</div>
							</div>

							<Button className="w-full" onClick={handlePlaceOrder} size="lg">
								Place Order
							</Button>

							<div className="flex items-start gap-3 border-t border-border pt-4">
								<MapPin aria-hidden="true" className="mt-0.5 shrink-0 text-burgundy" size={18} />
								<div className="min-w-0">
									<p className="text-sm font-semibold text-chocolate">Delivery information</p>
									{selectedLocation ? (
										<div className="mt-1 grid gap-1 text-sm leading-6 text-muted">
											<p>Selected PIN code: {selectedLocation.pinCode}</p>
											{deliveryEstimate && <p>{deliveryEstimate}</p>}
										</div>
									) : (
										<button
											className="mt-1 text-left text-sm leading-6 text-burgundy underline decoration-burgundy/40 underline-offset-4 transition-colors hover:text-burgundy-dark"
											onClick={openLocationSelector}
											type="button"
										>
											Select a delivery location to view the estimate
										</button>
									)}
								</div>
							</div>

						</aside>
					</div>
				)}
			</div>

			<Modal
				open={orderDialog !== null}
				title={orderDialog === "success" ? "Order Placed Successfully!" : "Confirm your order"}
				onClose={handleDialogClose}
			>
				{orderDialog === "confirm" ? (
					<div className="grid gap-5">
						<p className="text-sm leading-6 text-muted">
							Would you like to place this order?
						</p>
						{orderError && <p className="text-sm leading-6 text-burgundy" role="alert">{orderError}</p>}
						<div className="grid gap-3 sm:grid-cols-2">
							<Button onClick={handleDialogClose} size="lg" variant="outline">
								Not Yet
							</Button>
							<Button disabled={cartItems.length === 0} onClick={handleConfirmOrder} size="lg">
								Confirm Order
							</Button>
						</div>
					</div>
				) : orderDialog === "success" && orderSummary ? (
					<div className="grid gap-5">
						<div className="grid justify-items-center gap-3 text-center">
							<div className={`inline-flex size-16 items-center justify-center rounded-pill bg-cream-secondary text-burgundy transition-[opacity,transform] duration-500 motion-reduce:transition-none ${successEntered ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}>
								<CheckCircle2 aria-hidden="true" size={32} strokeWidth={1.7} />
							</div>
							<p className="text-sm leading-6 text-muted">
								Thank you for choosing Bakery Bar. Your order has been placed successfully.
							</p>
						</div>

						<div className="rounded-control border border-border bg-white p-4">
							<p className="mb-3 text-sm font-semibold text-chocolate">Order summary</p>
							<ul className="grid gap-3">
								{orderSummary.items.map((item, index) => (
									<li className="flex justify-between gap-4 text-sm" key={`${item.id}-${index}`}>
										<span className="min-w-0 text-chocolate">
											{item.name} × {item.quantity}
											{item.optionsLabel && (
												<span className="mt-1 block text-xs text-muted">{item.optionsLabel}</span>
											)}
										</span>
										<span className="shrink-0 font-semibold text-chocolate">
											{formatCurrency(item.price * item.quantity)}
										</span>
									</li>
								))}
							</ul>
							<div className="mt-4 flex justify-between gap-4 border-t border-border pt-3 font-bold text-chocolate">
								<span>Total</span>
								<span className="text-burgundy">{formatCurrency(orderSummary.total)}</span>
							</div>
							{orderSummary.deliveryEstimate && (
								<p className="mt-3 text-sm text-muted">{orderSummary.deliveryEstimate}</p>
							)}
						</div>

						<Button className="w-full" onClick={handleContinueShopping} size="lg">
							Continue Shopping
						</Button>
					</div>
				) : null}
			</Modal>
		</section>
	);
}

export default CartPage;