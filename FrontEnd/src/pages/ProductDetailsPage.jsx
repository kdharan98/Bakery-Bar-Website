import { useEffect, useRef, useState } from "react";
import {
	ArrowLeft,
	ChevronDown,
	MapPin,
	Minus,
	Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button.jsx";
import ProductGrid from "../features/products/ProductGrid.jsx";
import WishlistButton from "../features/wishlist/WishlistButton.jsx";
import categories from "../data/categories.js";
import products from "../data/products.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useLocationSelection } from "../context/LocationContext.jsx";
import formatCurrency from "../utils/formatCurrency.js";

function getOptionGroups(product) {
	return Array.isArray(product.options)
		? product.options.filter((group) => group?.name && Array.isArray(group.values) && group.values.length > 0)
		: [];
}

function getOptionValue(option) {
	if (typeof option === "string" || typeof option === "number") {
		return String(option);
	}
	if (option && typeof option === "object") {
		return String(option.value ?? option.id ?? option.label ?? "");
	}
	return "";
}

function getOptionLabel(option) {
	if (option && typeof option === "object") {
		return String(option.label ?? option.value ?? option.id ?? "");
	}
	return String(option);
}

function getInitialSelections(product) {
	return Object.fromEntries(
		getOptionGroups(product).map((group) => [group.name, getOptionValue(group.values[0])]),
	);
}

function getInformationText(value) {
	if (Array.isArray(value)) {
		return value.filter((item) => typeof item === "string" && item.trim()).join(", ");
	}
	return typeof value === "string" ? value.trim() : "";
}

function ProductDetailsPage({ product }) {
	const { addToCart } = useCart();
	const { runCartAction } = useAuth();
	const { selectedLocation, openLocationSelector } = useLocationSelection();
	const [added, setAdded] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const [imageIndex, setImageIndex] = useState(0);
	const [selectedOptions, setSelectedOptions] = useState(() => getInitialSelections(product));
	const mainImageAreaRef = useRef(null);
	const imageIndexRef = useRef(imageIndex);
	const touchStartRef = useRef(null);
	const wheelGestureRef = useRef({ accumulated: 0, direction: 0, lastEventAt: 0, nextAllowedAt: 0 });
	const category = categories.find((item) => item.slug === product.category);
	const images = Array.isArray(product.galleryImages) && product.galleryImages.length
		? product.galleryImages
		: Array.isArray(product.images) && product.images.length
			? product.images
			: [product.image];
	const optionGroups = getOptionGroups(product);
	const availabilityMessage = typeof product.availabilityStatus === "string"
		? product.availabilityStatus.trim()
		: typeof product.availability === "string"
			? product.availability.trim()
			: "";
	const deliveryEstimate = selectedLocation
		? `Delivery in ${selectedLocation.eta.replace(" minutes", " min")}`
		: "";
	const description = getInformationText(product.longDescription || product.description);
	const informationSections = [
		{ title: "Product Description", content: description },
		{ title: "Ingredients", content: getInformationText(product.ingredients) },
		{ title: "Storage Instructions", content: getInformationText(product.storageInstructions) },
	].filter((section) => section.content);
	const relatedProducts = products
		.filter((item) => item.active && item.category === product.category && item.id !== product.id)
		.slice(0, 4);
	imageIndexRef.current = imageIndex;

	useEffect(() => {
		setAdded(false);
		setQuantity(1);
		setImageIndex(0);
		setSelectedOptions(getInitialSelections(product));
		touchStartRef.current = null;
		wheelGestureRef.current = { accumulated: 0, direction: 0, lastEventAt: 0, nextAllowedAt: 0 };
	}, [product.id]);

	useEffect(() => {
		const imageArea = mainImageAreaRef.current;
		if (!imageArea || images.length < 2) {
			return undefined;
		}

		function handleWheel(event) {
			if (event.ctrlKey || event.deltaY === 0) {
				return;
			}

			const direction = Math.sign(event.deltaY);
			const currentIndex = imageIndexRef.current;
			const canNavigate = direction > 0
				? currentIndex < images.length - 1
				: currentIndex > 0;
			if (!canNavigate) {
				wheelGestureRef.current.accumulated = 0;
				return;
			}

			event.preventDefault();
			const now = Date.now();
			const gesture = wheelGestureRef.current;
			if (now < gesture.nextAllowedAt) {
				return;
			}
			if (now - gesture.lastEventAt > 250 || gesture.direction !== direction) {
				gesture.accumulated = 0;
			}

			const multiplier = event.deltaMode === 1
				? 16
				: event.deltaMode === 2
					? imageArea.clientHeight
					: 1;
			gesture.accumulated += event.deltaY * multiplier;
			gesture.direction = direction;
			gesture.lastEventAt = now;
			if (Math.abs(gesture.accumulated) < 80) {
				return;
			}

			setImageIndex((current) => Math.max(0, Math.min(images.length - 1, current + direction)));
			gesture.accumulated = 0;
			gesture.nextAllowedAt = now + 400;
		}

		imageArea.addEventListener("wheel", handleWheel, { passive: false });
		return () => imageArea.removeEventListener("wheel", handleWheel);
	}, [images.length]);

	function handleTouchStart(event) {
		if (event.touches.length !== 1) {
			touchStartRef.current = null;
			return;
		}

		const touch = event.touches[0];
		touchStartRef.current = { x: touch.clientX, y: touch.clientY };
	}

	function handleTouchEnd(event) {
		const start = touchStartRef.current;
		const touch = event.changedTouches[0];
		touchStartRef.current = null;
		if (!start || !touch || images.length < 2) {
			return;
		}

		const deltaX = touch.clientX - start.x;
		const deltaY = touch.clientY - start.y;
		if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) {
			return;
		}

		const direction = deltaX < 0 ? 1 : -1;
		setImageIndex((current) => Math.max(0, Math.min(images.length - 1, current + direction)));
	}

	function handleAddToCart() {
		const item = {
			id: product.id,
			name: product.name,
			price: product.price,
			image: product.image,
			quantity,
			...(optionGroups.length > 0 ? { selectedOptions } : {}),
		};
		runCartAction(() => {
			addToCart(item);
			setAdded(true);
		});
	}

	return (
		<section className="min-w-0 bg-cream py-8 sm:py-12">
			<div className="bb-container min-w-0">
				<Link
					className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-burgundy transition-colors hover:text-burgundy-dark"
					to={`/products?category=${product.category}`}
				>
					<ArrowLeft aria-hidden="true" size={17} />
					Back to {category?.name ?? "Our Products"}
				</Link>

				<div className="grid min-w-0 items-start gap-6 desktop:grid-cols-2 desktop:items-stretch desktop:gap-10">
					<div className="flex min-w-0 flex-col desktop:min-h-0">
						<div className="relative flex aspect-square min-h-0 flex-col overflow-hidden rounded-card border border-border bg-white shadow-[var(--shadow-card)] desktop:flex-1 desktop:flex-row-reverse desktop:gap-3 desktop:aspect-auto">
							<div
								className="relative min-h-0 min-w-0 flex-1 touch-pan-y"
								onTouchCancel={() => {
									touchStartRef.current = null;
								}}
								onTouchEnd={handleTouchEnd}
								onTouchStart={handleTouchStart}
								ref={mainImageAreaRef}
							>
								{images.map((image, index) => (
									<img
										alt={imageIndex === index
											? index === 0
												? product.alt
												: `${product.name}, view ${index + 1}`
											: ""}
										aria-hidden={imageIndex !== index}
										className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ease-in-out motion-reduce:transition-none ${imageIndex === index ? "opacity-100" : "opacity-0"}`}
										data-gallery-index={index}
										key={image}
										src={image}
									/>
								))}
								<div className="absolute right-4 top-4 z-10">
									<WishlistButton productId={product.id} productName={product.name} />
								</div>
							</div>

							{images.length > 1 && (
								<div aria-label="Product image gallery" className="flex shrink-0 gap-3 overflow-x-auto border-t border-border bg-white p-3 desktop:w-24 desktop:min-h-0 desktop:min-w-24 desktop:shrink desktop:flex-col desktop:overflow-x-hidden desktop:overflow-y-auto desktop:border-t-0 desktop:p-0 desktop:py-3 desktop:pl-3">
									{images.map((image, index) => (
										<button
											aria-label={`Show product image ${index + 1}`}
											aria-pressed={imageIndex === index}
											className={`size-20 shrink-0 overflow-hidden rounded-control border-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${imageIndex === index ? "border-burgundy" : "border-border hover:border-gold"}`}
											key={`${image}-${index}`}
											onClick={() => setImageIndex(index)}
											type="button"
										>
											<img alt="" className="h-full w-full bg-cream-secondary object-contain" src={image} />
										</button>
									))}
								</div>
							)}
						</div>
					</div>

					<div className="grid min-w-0 content-start gap-5 rounded-card border border-border bg-white p-5 shadow-[var(--shadow-card)] sm:p-7 desktop:p-8">
						<p className="text-xs font-bold uppercase tracking-[0.16em] text-burgundy">
							{category?.name ?? product.category}
						</p>
						<h1 className="font-heading text-3xl font-semibold leading-tight text-chocolate sm:text-4xl">
							{product.name}
						</h1>
						{product.description && (
							<p className="text-base leading-7 text-muted">{product.description}</p>
						)}

						<div>
							<p className="text-3xl font-bold text-burgundy">{formatCurrency(product.price)}</p>
							{product.priceIsDemo && (
								<p className="mt-1 text-xs text-muted">Illustrative demo price; not a confirmed selling price.</p>
							)}
						</div>

						{availabilityMessage && (
							<p className="rounded-control bg-cream-secondary px-4 py-3 text-sm font-semibold text-chocolate">
								{availabilityMessage}
							</p>
						)}

						{optionGroups.map((group) => (
							<label className="grid min-w-0 gap-2 text-sm font-semibold text-chocolate" key={group.name}>
								{group.name}
								<select
									className="min-h-11 w-full rounded-control border border-border bg-white px-3 text-body outline-none transition-colors focus:border-burgundy focus:ring-2 focus:ring-burgundy/15"
									onChange={(event) => {
										setSelectedOptions((current) => ({ ...current, [group.name]: event.target.value }));
										setAdded(false);
									}}
									value={selectedOptions[group.name] ?? getOptionValue(group.values[0])}
								>
									{group.values.map((option) => (
										<option key={getOptionValue(option)} value={getOptionValue(option)}>
											{getOptionLabel(option)}
										</option>
									))}
								</select>
							</label>
						))}

						<div className="flex items-center justify-between gap-4">
							<span className="text-sm font-semibold text-chocolate">Quantity</span>
							<div aria-label="Quantity" className="inline-flex h-11 items-center rounded-control border border-border">
								<button
									aria-label="Decrease quantity"
									className="inline-flex size-11 items-center justify-center rounded-l-control text-chocolate transition-colors hover:bg-cream-secondary disabled:cursor-not-allowed disabled:opacity-40"
									disabled={quantity <= 1}
									onClick={() => setQuantity((current) => Math.max(1, current - 1))}
									type="button"
								>
									<Minus aria-hidden="true" size={16} />
								</button>
								<output aria-live="polite" className="min-w-10 text-center text-sm font-semibold text-chocolate">
									{quantity}
								</output>
								<button
									aria-label="Increase quantity"
									className="inline-flex size-11 items-center justify-center rounded-r-control text-chocolate transition-colors hover:bg-cream-secondary"
									onClick={() => setQuantity((current) => current + 1)}
									type="button"
								>
									<Plus aria-hidden="true" size={16} />
								</button>
							</div>
						</div>

						<div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
							<Button className="w-full" onClick={handleAddToCart} size="lg">
								<Plus aria-hidden="true" size={18} />
								Add to Cart
							</Button>
							<WishlistButton productId={product.id} productName={product.name} />
						</div>
						<p aria-live="polite" className="min-h-5 text-sm text-burgundy" role="status">
							{added ? `${product.name} added to your bag.` : ""}
						</p>

						<div className="flex items-start gap-3 border-t border-border pt-4">
							<MapPin aria-hidden="true" className="mt-0.5 shrink-0 text-burgundy" size={18} />
							<div className="min-w-0">
								<p className="text-sm font-semibold text-chocolate">Delivery information</p>
								{selectedLocation ? (
									<p className="mt-1 text-sm leading-6 text-muted">{deliveryEstimate}</p>
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
					</div>
				</div>

				{informationSections.length > 0 && (
					<div className="mt-8 overflow-hidden rounded-card border border-border bg-white shadow-sm">
						{informationSections.map((section) => (
							<details className="group border-b border-border last:border-b-0" key={section.title}>
								<summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-semibold text-chocolate transition-colors hover:text-burgundy sm:px-6">
									{section.title}
									<ChevronDown aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180" size={18} />
								</summary>
								<p className="px-5 pb-5 text-sm leading-6 text-muted sm:px-6">{section.content}</p>
							</details>
						))}
					</div>
				)}

				{relatedProducts.length > 0 && (
					<section aria-labelledby="related-products-heading" className="mt-12 sm:mt-16">
						<div className="mb-6 flex items-end justify-between gap-4">
							<div>
								<p className="text-xs font-bold uppercase tracking-[0.16em] text-burgundy">More from {category?.name ?? "this collection"}</p>
								<h2 className="mt-2 font-heading text-3xl font-semibold text-chocolate" id="related-products-heading">
									You May Also Like
								</h2>
							</div>
							<Link
								className="shrink-0 text-sm font-semibold text-burgundy underline decoration-burgundy/40 underline-offset-4 transition-colors hover:text-burgundy-dark"
								to={`/products?category=${product.category}`}
							>
								View all
							</Link>
						</div>
						<ProductGrid products={relatedProducts} />
					</section>
				)}
			</div>
		</section>
	);
}

export default ProductDetailsPage;
