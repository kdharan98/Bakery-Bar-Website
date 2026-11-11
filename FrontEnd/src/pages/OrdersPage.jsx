import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getOrdersForUser } from "../services/orders.js";
import formatCurrency from "../utils/formatCurrency.js";

function formatOrderDate(value) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "Date unavailable";
	}

	return new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
}

function OrdersPage() {
	const { user } = useAuth();
	const username = user?.username;
	const { orders, error } = useMemo(
		() => {
			try {
				return { orders: username ? getOrdersForUser(username) : [], error: "" };
			} catch (loadError) {
				console.error("Could not load this customer's orders.", loadError);
				return {
					orders: [],
					error: "We couldn't load your orders. Please refresh and try again.",
				};
			}
		},
		[username],
	);

	return (
		<section className="bg-cream px-5 py-12 sm:py-16">
			<div className="bb-container grid max-w-4xl gap-5">
				<p className="text-xs font-bold uppercase tracking-[0.16em] text-burgundy">Your account</p>
				<h1 className="font-heading text-4xl font-semibold leading-tight text-chocolate sm:text-5xl">
					My Orders
				</h1>
				{error ? (
					<p className="max-w-2xl text-base leading-7 text-burgundy" role="alert">{error}</p>
				) : orders.length === 0 ? (
					<>
						<p className="max-w-2xl text-base leading-7 text-muted">
							{username
								? "You don't have any orders yet. Your placed orders will appear here."
								: "Sign in to view your Bakery Bar orders."}
						</p>
						<Link
							className="mt-2 inline-flex min-h-11 w-fit items-center justify-center rounded-control border border-burgundy bg-burgundy px-5 text-sm font-semibold text-white transition-colors hover:border-burgundy-dark hover:bg-burgundy-dark"
							to="/products"
						>
							Explore Products
						</Link>
					</>
				) : (
					<div className="grid gap-5">
						{orders.map((order) => (
							<article className="grid gap-5 rounded-card border border-border bg-white p-4 shadow-[var(--shadow-card)] sm:p-6" key={order.id}>
								<header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
									<div className="grid gap-1">
										<p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Order {order.id}</p>
										<time className="text-sm text-muted" dateTime={order.createdAt}>{formatOrderDate(order.createdAt)}</time>
									</div>
									<span className="rounded-pill bg-cream-secondary px-3 py-1 text-xs font-semibold text-burgundy">{order.status}</span>
								</header>

								<ul className="grid gap-4">
									{order.items.map((item, index) => (
										<li className="flex min-w-0 items-center gap-3 sm:gap-4" key={`${item.productId}-${index}`}>
											<div className="size-16 shrink-0 overflow-hidden rounded-control bg-cream-secondary sm:size-20">
												{item.image && <img alt={item.name} className="h-full w-full object-cover" loading="lazy" src={item.image} />}
											</div>
											<div className="min-w-0 flex-1">
												<p className="font-semibold text-chocolate">{item.name}</p>
												{item.optionsLabel && <p className="mt-1 text-xs leading-5 text-muted">{item.optionsLabel}</p>}
												<p className="mt-1 text-sm text-muted">
													{item.quantity} × {formatCurrency(item.unitPrice)}
												</p>
											</div>
											<p className="shrink-0 text-right text-sm font-semibold text-chocolate">{formatCurrency(item.itemSubtotal)}</p>
										</li>
									))}
								</ul>

								<div className="grid gap-2 border-t border-border pt-4 text-sm">
									<div className="flex justify-between gap-4 text-muted">
										<span>Subtotal</span>
										<span>{formatCurrency(order.subtotal)}</span>
									</div>
									{order.deliveryFee !== null && (
										<div className="flex justify-between gap-4 text-muted">
											<span>Delivery fee</span>
											<span>{formatCurrency(order.deliveryFee)}</span>
										</div>
									)}
									<div className="flex justify-between gap-4 font-bold text-chocolate">
										<span>Total</span>
										<span className="text-burgundy">{formatCurrency(order.total)}</span>
									</div>
								</div>

								{(order.deliveryLocation || order.deliveryEstimate) && (
									<div className="grid gap-1 text-sm text-muted">
										{order.deliveryLocation?.pinCode && <p>Delivery PIN: {order.deliveryLocation.pinCode}</p>}
										{order.deliveryEstimate && <p>{order.deliveryEstimate}</p>}
									</div>
								)}
							</article>
						))}
					</div>
				)}
			</div>
		</section>
	);
}

export default OrdersPage;
