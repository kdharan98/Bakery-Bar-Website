import { Heart } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext.jsx";

function WishlistButton({ productId, productName }) {
	const { isWishlisted, toggleWishlist } = useWishlist();
	const active = isWishlisted(productId);

	return (
		<button
			aria-label={`${active ? "Remove" : "Add"} ${productName} ${active ? "from" : "to"} wishlist`}
			aria-pressed={active}
			className={`inline-flex size-10 items-center justify-center rounded-pill border border-border bg-white/95 shadow-sm transition-colors hover:border-burgundy hover:text-burgundy ${active ? "text-burgundy" : "text-chocolate"}`}
			onClick={() => toggleWishlist(productId)}
			type="button"
		>
			<Heart aria-hidden="true" className={active ? "fill-burgundy" : ""} size={19} strokeWidth={1.7} />
		</button>
	);
}

export default WishlistButton;