import ProductCard from "../../components/ui/ProductCard.jsx";

function ProductGrid({ id, products, className = "", variant = "shopping", layout = "default" }) {
	const columns = layout === "catalogue"
		? "min-[360px]:grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4"
		: "min-[440px]:grid-cols-2 desktop:grid-cols-3 wide:grid-cols-4";

	return (
		<div aria-label="Products" className={`grid min-w-0 grid-cols-1 gap-4 tablet:gap-5 desktop:gap-6 ${columns} ${className}`} id={id}>
			{products.map((product) => <ProductCard key={product.id} product={product} variant={variant} />)}
		</div>
	);
}

export default ProductGrid;