import { useEffect, useState } from "react";
import {
	CheckCircle2,
	ChevronDown,
	MapPin,
	Menu,
	ShoppingBag,
	UserRound,
	X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";
import { useLocationSelection } from "../../context/LocationContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import AccountMenu from "../../features/authentication/AccountMenu.jsx";
import AuthModal from "../../features/authentication/AuthModal.jsx";
import LocationModal from "../../features/location/LocationModal.jsx";

const navigation = [
	{ label: "Home", action: "home" },
	{ label: "About Us", action: "about" },
	{ label: "Contact", action: "contact" },
];

const categories = [
	["Cakes", "cakes"],
	["Wedding Cakes", "wedding-cakes"],
	["Kulfi", "kulfi"],
	["Pizza", "pizza"],
	["Breads & Buns", "breads-buns"],
	["Drinks", "drinks"],
	["Cookies", "cookies"],
];

function Header({ onHomeClick, onAboutClick, onContactClick }) {
	const { cartCount, clearCart } = useCart();
	const navigate = useNavigate();
	const {
		user,
		authModalOpen,
		authMode,
		authNotice,
		openAuthModal,
		closeAuthModal,
		changeAuthMode,
		dismissAuthNotice,
		signIn,
		signUp,
		signOut,
	} = useAuth();
	const {
		selectedLocation,
		confirmLocation,
		clearLocation,
		locationSelectorOpen,
		openLocationSelector,
		closeLocationSelector,
	} = useLocationSelection();
	const [productsOpen, setProductsOpen] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [mobileSignOutError, setMobileSignOutError] = useState("");
	const [locationSavedNotice, setLocationSavedNotice] = useState("");

	useEffect(() => {
		if (!locationSavedNotice) {
			return undefined;
		}

		const timeout = window.setTimeout(() => setLocationSavedNotice(false), 6000);
		return () => window.clearTimeout(timeout);
	}, [locationSavedNotice]);

	useEffect(() => {
		if (!authNotice) {
			return undefined;
		}

		const timeout = window.setTimeout(dismissAuthNotice, 6000);
		return () => window.clearTimeout(timeout);
	}, [authNotice]);

	function handleLocationConfirm(pinCode) {
		const result = confirmLocation(pinCode);
		if (!result.available) {
			return result;
		}

		closeLocationSelector();
		setLocationSavedNotice(
			`PIN ${result.pinCode} saved. Demonstration delivery estimate: ${result.eta}. This estimate is not guaranteed.`,
		);
		return result;
	}

	function closeMenus() {
		setProductsOpen(false);
		setMobileOpen(false);
	}

	function handleSignOut() {
		const result = signOut();
		if (!result.success) {
			return result;
		}

		clearCart();
		clearLocation();
		setMobileSignOutError("");
		closeMenus();
		navigate("/");
		window.requestAnimationFrame(() => window.scrollTo(0, 0));
		return result;
	}

	function handleMobileSignOut() {
		const result = handleSignOut();
		if (!result?.success) {
			setMobileSignOutError("We couldn't sign you out. Please try again.");
		}
	}

	function renderNavigationItem(item, mobile = false) {
		const className = mobile
			? "flex min-h-12 items-center border-b border-border text-sm font-semibold text-chocolate"
			: "text-sm font-semibold text-chocolate transition-colors hover:text-burgundy";

		if (item.action) {
			const handleClick = item.action === "home"
				? onHomeClick
				: item.action === "about"
					? onAboutClick
					: onContactClick;
			return (
				<button
					className={`${className} transition-colors hover:text-burgundy`}
					key={item.label}
					onClick={() => {
						closeMenus();
						handleClick();
					}}
					type="button"
				>
					{item.label}
				</button>
			);
		}

		return (
			<Link className={className} key={item.to} onClick={closeMenus} to={item.to}>
				{item.label}
			</Link>
		);
	}

	const productsMenu = (
		<div
			className="absolute left-0 top-full z-30 mt-3 min-w-56 border border-border bg-white py-2 shadow-[var(--shadow-card)]"
			hidden={!productsOpen}
			id="desktop-products-menu"
		>
			{categories.map(([label, slug]) => (
				<Link
					className="block px-4 py-2 text-sm text-body transition-colors hover:bg-cream hover:text-burgundy"
					key={slug}
					onClick={closeMenus}
					to={`/products?category=${slug}`}
				>
					{label}
				</Link>
			))}
		</div>
	);

	const productToggle = (menuId) => (
		<button
			aria-controls={menuId}
			aria-expanded={productsOpen}
			aria-label="Browse product categories"
			className="inline-flex size-10 shrink-0 items-center justify-center text-chocolate transition-colors hover:text-burgundy"
			onClick={() => setProductsOpen((open) => !open)}
			title="Browse product categories"
			type="button"
		>
			<ChevronDown aria-hidden="true" className={`transition-transform ${productsOpen ? "rotate-180" : ""}`} size={17} />
		</button>
	);

	return (
		<header className="sticky top-0 z-40 border-b border-border bg-cream shadow-sm">
			<a
				className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2"
				href="#main-content"
			>
				Skip to content
			</a>
			<div className="bb-container flex min-h-[76px] items-center justify-between gap-2 py-3 desktop:grid desktop:min-h-[92px] desktop:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] desktop:gap-5">
				<Link
					aria-label="Bakery Bar home"
					className="flex shrink-0 items-center leading-none desktop:justify-self-start"
					onClick={(event) => {
						if (onHomeClick) {
							event.preventDefault();
							closeMenus();
							onHomeClick();
						}
					}}
					to="/"
				>
					<img
						alt="Bakery Bar"
						className="h-auto w-[90px] object-contain desktop:w-[190px]"
						height="800"
						src="/images/brand/bakery-bar-logo.png"
						width="2048"
					/>
				</Link>

				<nav aria-label="Main navigation" className="hidden items-center gap-6 desktop:flex desktop:justify-self-center desktop:gap-4 wide:gap-6">
					{navigation.slice(0, 2).map((item) => renderNavigationItem(item))}
					<div className="relative">
						<div className="flex items-center">
							<Link
								className="text-sm font-semibold text-chocolate transition-colors hover:text-burgundy"
								onClick={closeMenus}
								to="/products"
							>
								Our Products
							</Link>
							{productToggle("desktop-products-menu")}
						</div>
						{productsMenu}
					</div>
					{navigation.slice(2).map((item) => renderNavigationItem(item))}
				</nav>

				<div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-1.5 desktop:ml-0 desktop:w-full desktop:justify-self-end">
					<button
						aria-label={selectedLocation ? `Delivery in ${selectedLocation.eta.replace(" minutes", " min")}` : "Select your location"}
						className="flex min-w-0 max-w-[150px] flex-1 items-center gap-1 rounded-control px-0 py-1 text-left text-chocolate transition-colors hover:text-burgundy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold desktop:max-w-none desktop:flex-none desktop:gap-2 desktop:px-2.5"
						onClick={openLocationSelector}
						type="button"
					>
						<MapPin aria-hidden="true" className="size-4 shrink-0 text-burgundy desktop:size-[18px]" size={18} strokeWidth={1.8} />
						<span className="min-w-0 text-[0.65rem] font-bold leading-4 desktop:whitespace-nowrap desktop:text-sm">
							{selectedLocation ? `Delivery in ${selectedLocation.eta.replace(" minutes", " min")}` : "Select your location"}
						</span>
					</button>
					<div className="flex shrink-0 items-center gap-1.5">
						<AccountMenu onSignOut={handleSignOut} />
						<Link
							aria-label={`Shopping bag, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
							className="relative inline-flex size-11 items-center justify-center text-chocolate transition-colors hover:text-burgundy"
							to="/cart"
						>
							<ShoppingBag aria-hidden="true" size={20} strokeWidth={1.7} />
							<span className="absolute right-0 top-0 inline-flex min-w-5 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded-pill bg-burgundy px-1 text-[0.65rem] font-bold leading-5 text-white">
								{cartCount > 99 ? "99+" : cartCount}
							</span>
						</Link>
						<button
							aria-controls="mobile-navigation"
							aria-expanded={mobileOpen}
							aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
							className="inline-flex size-11 items-center justify-center text-chocolate transition-colors hover:text-burgundy desktop:hidden"
							onClick={() => setMobileOpen((open) => !open)}
							type="button"
						>
							{mobileOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
						</button>
					</div>
				</div>
			</div>

			<nav
				aria-label="Mobile navigation"
				className="absolute inset-x-0 top-full border-b border-border bg-cream px-5 pb-5 pt-2 shadow-[var(--shadow-card)] desktop:hidden"
				hidden={!mobileOpen}
				id="mobile-navigation"
			>
					<div className="mx-auto grid max-w-7xl">
						{navigation.slice(0, 2).map((item) => renderNavigationItem(item, true))}
						<div className="border-b border-border">
							<div className="flex min-h-12 items-center justify-between">
								<Link className="flex min-h-12 items-center text-sm font-semibold text-chocolate" onClick={closeMenus} to="/products">
									Our Products
								</Link>
								{productToggle("mobile-products-menu")}
							</div>
							<div className="grid grid-cols-2 gap-x-4 pb-3 pl-3" hidden={!productsOpen} id="mobile-products-menu">
								{categories.map(([label, slug]) => (
									<Link className="flex min-h-11 items-center text-sm text-muted hover:text-burgundy" key={slug} onClick={closeMenus} to={`/products?category=${slug}`}>
										{label}
									</Link>
								))}
							</div>
						</div>
						{navigation.slice(2).map((item) => renderNavigationItem(item, true))}
						<div className="grid gap-1 border-t border-border pt-3">
							{user ? (
								<>
									<p className="py-2 text-sm text-muted">Welcome, <span className="font-semibold text-chocolate">{user.username}</span></p>
									<Link className="flex min-h-11 items-center text-sm font-semibold text-chocolate hover:text-burgundy" onClick={closeMenus} to="/orders">
										My Orders
									</Link>
									<button className="flex min-h-11 items-center text-left text-sm font-semibold text-chocolate hover:text-burgundy" onClick={handleMobileSignOut} type="button">
										Sign Out
									</button>
									{mobileSignOutError && <p className="text-sm text-burgundy" role="alert">{mobileSignOutError}</p>}
								</>
							) : (
								<button
									className="flex min-h-11 items-center gap-2 text-sm font-semibold text-chocolate hover:text-burgundy"
									onClick={() => {
										closeMenus();
										openAuthModal("signin");
									}}
									type="button"
								>
									<UserRound aria-hidden="true" size={17} /> Sign In
								</button>
							)}
						</div>
					</div>
			</nav>
			<LocationModal
				onClear={clearLocation}
				onClose={closeLocationSelector}
				onConfirm={handleLocationConfirm}
				open={locationSelectorOpen}
				selectedLocation={selectedLocation}
			/>
			<AuthModal
				mode={authMode}
				onClose={closeAuthModal}
				onModeChange={changeAuthMode}
				onSignIn={signIn}
				onSignUp={signUp}
				open={authModalOpen}
			/>
			{locationSavedNotice && (
				<div
					className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 items-start gap-3 rounded-card border border-gold/60 bg-cream px-5 py-4 text-sm leading-6 text-chocolate shadow-[var(--shadow-card)]"
					role="status"
				>
					<CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-burgundy" size={19} />
					<span>{locationSavedNotice}</span>
				</div>
			)}
			{authNotice && (
				<div
					className={`fixed left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 items-start gap-3 rounded-card border border-gold/60 bg-cream px-5 py-4 text-sm leading-6 text-chocolate shadow-[var(--shadow-card)] ${locationSavedNotice ? "bottom-24" : "bottom-5"}`}
					role="status"
				>
					<CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-burgundy" size={19} />
					<span>{authNotice}</span>
				</div>
			)}
		</header>
	);
}

export default Header;