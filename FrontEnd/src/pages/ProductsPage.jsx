import { useEffect, useLayoutEffect, useState } from "react";
import { ArrowDownUp, ChevronDown, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import ProductGrid from "../features/products/ProductGrid.jsx";
import categories from "../data/categories.js";
import products from "../data/products.js";
import ProductDetailsPage from "./ProductDetailsPage.jsx";

const categoryOptions = [
	{ name: "All", slug: "all" },
	...categories.map(({ name, slug }) => ({ name, slug })),
];

const initialDocumentPath = typeof window === "undefined" ? "" : window.location.pathname;
const [initialNavigation] = typeof window === "undefined"
	? []
	: window.performance.getEntriesByType("navigation");
const initialProductsReload = initialDocumentPath === "/products" && initialNavigation?.type === "reload";
let initialProductsReloadHandled = false;

function shouldResetInitialProductFilters() {
	return initialProductsReload && !initialProductsReloadHandled;
}

function ProductsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [resetReloadFilters, setResetReloadFilters] = useState(shouldResetInitialProductFilters);
	const [searchTerm, setSearchTerm] = useState(() => (
		resetReloadFilters ? "" : searchParams.get("search") ?? ""
	));
	const [sortBy, setSortBy] = useState("recommended");
	const [navbarHeight, setNavbarHeight] = useState(0);
	const searchQuery = searchParams.get("search") ?? "";
	const productId = searchParams.get("item");
	const selectedProduct = products.find((product) => product.id === productId && product.active);
	const requestedCategory = searchParams.get("category");
	const selectedCategory = !resetReloadFilters && categories.some((category) => category.slug === requestedCategory)
		? requestedCategory
		: "all";

	useEffect(() => {
		if (!resetReloadFilters) {
			setSearchTerm(searchQuery);
		}
	}, [searchQuery, resetReloadFilters]);

	useEffect(() => {
		if (!resetReloadFilters) {
			return;
		}

		initialProductsReloadHandled = true;
		const nextSearchParams = new URLSearchParams(searchParams);
		nextSearchParams.delete("category");
		nextSearchParams.delete("search");
		if (nextSearchParams.toString() !== searchParams.toString()) {
			setSearchParams(nextSearchParams, { replace: true });
		}
		setResetReloadFilters(false);
	}, [resetReloadFilters, searchParams, setSearchParams]);

	useLayoutEffect(() => {
		const navbar = document.querySelector("header.sticky");
		if (!navbar) {
			return undefined;
		}

		const updateNavbarHeight = () => setNavbarHeight(navbar.getBoundingClientRect().height);
		const observer = new ResizeObserver(updateNavbarHeight);
		window.addEventListener("resize", updateNavbarHeight);
		observer.observe(navbar);
		updateNavbarHeight();

		return () => {
			observer.disconnect();
			window.removeEventListener("resize", updateNavbarHeight);
		};
	}, []);

	if (productId) {
		if (selectedProduct) {
			return <ProductDetailsPage product={selectedProduct} />;
		}

		return (
			<section className="bg-cream px-5 py-16 sm:py-24">
				<div className="bb-container grid max-w-5xl gap-5">
					<p className="text-xs font-bold uppercase tracking-[0.16em] text-burgundy">The collection</p>
					<h1 className="font-heading text-4xl font-semibold text-chocolate">Product not found</h1>
					<p className="text-base text-muted">This product is not currently listed.</p>
					<Link className="text-sm font-semibold text-burgundy underline underline-offset-4" to="/products">
						Return to Our Products
					</Link>
				</div>
			</section>
		);
	}

	const sortLabels = {
		recommended: "Recommended",
		"price-low": "Price: Low to High",
		"price-high": "Price: High to Low",
		name: "Name: A to Z",
	};
	const visibleProducts = products
		.filter((product) => {
			const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
			const matchesSearch = !searchTerm.trim()
				|| product.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
			return product.active && matchesCategory && matchesSearch;
		})
		.sort((first, second) => {
			if (sortBy === "price-low") {
				return first.price - second.price;
			}
			if (sortBy === "price-high") {
				return second.price - first.price;
			}
			if (sortBy === "name") {
				return first.name.localeCompare(second.name);
			}
			return 0;
		});

	function selectCategory(slug) {
		const nextSearchParams = new URLSearchParams(searchParams);
		nextSearchParams.delete("item");
		if (slug === "all") {
			nextSearchParams.delete("category");
		} else {
			nextSearchParams.set("category", slug);
		}
		setSearchParams(nextSearchParams);
	}

	function updateSearch(event) {
		const nextSearch = event.target.value;
		setSearchTerm(nextSearch);
		const nextSearchParams = new URLSearchParams(searchParams);
		nextSearchParams.delete("item");
		if (nextSearch.trim()) {
			nextSearchParams.set("search", nextSearch);
		} else {
			nextSearchParams.delete("search");
		}
		setSearchParams(nextSearchParams, { replace: true });
	}

	return (
		<section className="min-w-0 bg-cream">
			<div
				className="sticky z-30 border-b border-border bg-cream shadow-sm"
				style={{ top: navbarHeight }}
			>
				<div className="bb-container min-w-0 py-2 sm:py-3">
					<div className="-mx-5 overflow-x-auto overscroll-x-contain px-5 pb-1 desktop:mx-0 desktop:overflow-visible desktop:px-0">
						<div aria-label="Product categories" className="flex w-max min-w-full gap-2" role="tablist">
							{categoryOptions.map(({ name, slug }) => {
								const active = selectedCategory === slug;
								return (
									<button
										aria-selected={active}
										aria-controls="product-grid"
										className={`min-h-10 shrink-0 rounded-pill border px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${active ? "border-burgundy bg-burgundy text-white" : "border-border bg-white text-chocolate hover:border-burgundy hover:text-burgundy"}`}
										key={slug}
										onClick={() => selectCategory(slug)}
										role="tab"
										type="button"
									>
										{name}
									</button>
								);
							})}
						</div>
					</div>

					<div className="mt-2 grid min-w-0 grid-cols-[minmax(0,1fr)_9rem] gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
						<label className="relative block min-w-0" htmlFor="product-search">
							<span className="sr-only">Search products</span>
							<Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={17} />
							<input
								autoComplete="off"
								className="h-11 w-full rounded-full border border-border bg-white pl-11 pr-4 text-body outline-none transition-colors placeholder:text-muted hover:border-gold focus:border-burgundy focus:ring-2 focus:ring-burgundy/15"
								id="product-search"
								onChange={updateSearch}
								placeholder="Search by product name"
								type="search"
								value={searchTerm}
							/>
						</label>

						<label
							className="relative flex h-11 min-w-0 items-center gap-2 rounded-full border border-border bg-white px-3 text-xs font-semibold text-chocolate transition-colors hover:border-gold focus-within:border-burgundy focus-within:ring-2 focus-within:ring-burgundy/15 sm:w-auto sm:max-w-[15rem] sm:px-4 sm:text-sm"
							htmlFor="product-sort"
						>
							<ArrowDownUp aria-hidden="true" className="shrink-0 text-muted" size={16} />
							<span aria-hidden="true" className="min-w-0 flex-1 truncate">Sort: {sortLabels[sortBy]}</span>
							<ChevronDown aria-hidden="true" className="shrink-0 text-muted" size={16} />
							<select
								aria-label="Sort products"
								className="product-sort-select absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
								id="product-sort"
								onChange={(event) => setSortBy(event.target.value)}
								value={sortBy}
							>
								<option value="recommended">Recommended</option>
								<option value="price-low">Price: Low to High</option>
								<option value="price-high">Price: High to Low</option>
								<option value="name">Name: A to Z</option>
							</select>
						</label>
					</div>
				</div>
			</div>

			<div className="bb-container min-w-0 pt-5 pb-12 sm:pt-6 sm:pb-16">

				<p aria-live="polite" className="mb-4 text-sm text-muted">
					{visibleProducts.length} {visibleProducts.length === 1 ? "product" : "products"}
				</p>

				{visibleProducts.length ? (
					<ProductGrid id="product-grid" layout="catalogue" products={visibleProducts} />
				) : (
					<p className="border-y border-border py-8 text-sm text-muted" role="status">
						No products match your search. Try another name or category.
					</p>
				)}
			</div>
		</section>
	);
}

export default ProductsPage;
