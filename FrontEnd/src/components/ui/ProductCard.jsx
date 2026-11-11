import { useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import WishlistButton from "../../features/wishlist/WishlistButton.jsx";
import Button from "../common/Button.jsx";
import Rating from "./Rating.jsx";
import formatCurrency from "../../utils/formatCurrency.js";
import categories from "../../data/categories.js";

function ProductCard({ product, variant = "shopping" }) {
	const { addToCart } = useCart();
	const { runCartAction } = useAuth();
	const [added, setAdded] = useState(false);
	const [imageIndex, setImageIndex] = useState(0);
	const isShowcase = variant === "showcase";
	const images = product.images?.length ? product.images : [product.image];
	const categoryName = categories.find((category) => category.slug === product.category)?.name ?? product.category;
	const productPath = `/products?category=${product.category}&item=${product.id}`;

	function handleAddToCart() {
		const item = {
			id: product.id,
			name: product.name,
			price: product.price,
			image: product.image,
			quantity: 1,
		};
		runCartAction(() => {
			addToCart(item);
			setAdded(true);
		});
	}

	return (
		<article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-border bg-white shadow-sm">
			<div className="relative aspect-square min-w-0 overflow-hidden bg-cream-secondary">
				<Link aria-label={`View ${product.name}`} className="absolute inset-0 flex items-center justify-center" to={productPath}>
					<img
						alt={product.alt}
						className={`h-full w-full rounded-t-[20px] rounded-b-none ${isShowcase ? "object-contain" : "object-cover"} transition-transform duration-300 group-hover:scale-[1.02]`}
						loading="lazy"
						src={images[imageIndex]}
					/>
				</Link>
				{product.bestSeller && (
					<span className="absolute left-3 top-3 rounded-pill bg-cream px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-burgundy shadow-sm">
						Best Seller
					</span>
				)}
				{!isShowcase && (
					<div className="absolute right-3 top-3">
						<WishlistButton productId={product.id} productName={product.name} />
					</div>
				)}
				{images.length > 1 && (
					<div aria-label="Product images" className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
						{images.map((image, index) => (
							<button
								aria-label={`Show product image ${index + 1}`}
								aria-pressed={imageIndex === index}
								className={`size-2 rounded-pill border border-chocolate/40 ${imageIndex === index ? "bg-burgundy" : "bg-white"}`}
								key={image}
								onClick={() => setImageIndex(index)}
								type="button"
							/>
						))}
					</div>
				)}
			</div>
			<div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
				<p className="mb-1 truncate text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted">{categoryName}</p>
				<div className={`flex min-w-0 items-start justify-between gap-2 ${isShowcase ? "mt-auto" : "mb-4"}`}>
					<h3 className="line-clamp-2 min-w-0 flex-1 break-words font-heading text-lg font-semibold leading-tight text-chocolate sm:text-xl">
						<Link className="transition-colors hover:text-burgundy" to={productPath}>{product.name}</Link>
					</h3>
					<span className="shrink-0 pt-0.5 text-sm font-bold text-burgundy">{formatCurrency(product.price)}</span>
				</div>
				{product.ratingVerified === true && Number.isFinite(product.rating) && (
					<Rating className="mb-3" showValue size={14} value={product.rating} />
				)}
				{!isShowcase && (
					<div className="mt-auto">
						<Button className="w-full min-w-0 px-2 text-xs sm:text-sm" onClick={handleAddToCart}>
							<Plus aria-hidden="true" size={16} /> Add to Cart
						</Button>
						<p aria-live="polite" className="mt-1 min-h-4 truncate text-center text-[0.65rem] text-burgundy">
							{added ? `${product.name} added to your bag.` : ""}
						</p>
					</div>
				)}
			</div>
		</article>
	);
}

export default ProductCard;