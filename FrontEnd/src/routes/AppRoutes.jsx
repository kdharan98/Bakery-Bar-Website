import { Route, Routes } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout.jsx";
import SectionTitle from "../components/ui/SectionTitle.jsx";
import HomePage from "../pages/HomePage.jsx";
import CartPage from "../pages/CartPage.jsx";
import OrdersPage from "../pages/OrdersPage.jsx";
import ProductsPage from "../pages/ProductsPage.jsx";

const temporaryPages = {
	home: {
		eyebrow: "Homepage preview",
		title: "Welcome to Bakery Bar.",
		description: "The Bakery Bar homepage will be developed in the next stage.",
	},
	about: {
		eyebrow: "About Bakery Bar",
		title: "Our story is taking shape.",
		description: "This temporary page is reserved for the Bakery Bar story and its people.",
	},
	products: {
		eyebrow: "The collection",
		title: "Explore our products soon.",
		description: "The product catalogue and category browsing experience are not built yet.",
	},
	customCakes: {
		eyebrow: "Made for your occasion",
		title: "Custom cakes are coming soon.",
		description: "This page will introduce custom cake options and enquiry details in a future stage.",
	},
	contact: {
		eyebrow: "Get in touch",
		title: "Contact details are coming soon.",
		description: "Bakery Bar contact information will be added when it is provided by the business.",
	},
	account: {
		eyebrow: "Your account",
		title: "Sign in from the account menu.",
		description: "Use the account icon in the header to sign in or create your Bakery Bar account.",
	},
	delivery: {
		eyebrow: "Customer care",
		title: "Delivery information is coming soon.",
		description: "Delivery areas, timing, and policies will be added when confirmed by Bakery Bar.",
	},
	faq: {
		eyebrow: "Customer care",
		title: "Frequently asked questions are coming soon.",
		description: "Answers to common customer questions will be published here in a future stage.",
	},
	notFound: {
		eyebrow: "Page not found",
		title: "This page is not part of the preview.",
		description: "The address may be incorrect, or this page has not been configured yet.",
	},
};

function TemporaryPage({ page }) {
	return (
		<div className="bg-cream px-5 py-16 sm:py-24">
			<div className="bb-container grid max-w-5xl gap-5">
				<span className="text-xs font-bold uppercase tracking-[0.16em] text-burgundy">{page.eyebrow}</span>
				<SectionTitle
					title={page.title}
					subtitle={page.description}
				/>
			</div>
		</div>
	);
}

function AppRoutes() {
	return (
		<Routes>
			<Route element={<MainLayout />}>
				<Route index element={<HomePage />} />
				<Route path="about" element={<TemporaryPage page={temporaryPages.about} />} />
				<Route path="products" element={<ProductsPage />} />
				<Route path="custom-cakes" element={<TemporaryPage page={temporaryPages.customCakes} />} />
				<Route path="contact" element={<TemporaryPage page={temporaryPages.contact} />} />
				<Route path="account" element={<TemporaryPage page={temporaryPages.account} />} />
				<Route path="cart" element={<CartPage />} />
				<Route path="orders" element={<OrdersPage />} />
				<Route path="delivery" element={<TemporaryPage page={temporaryPages.delivery} />} />
				<Route path="faq" element={<TemporaryPage page={temporaryPages.faq} />} />
				<Route path="*" element={<TemporaryPage page={temporaryPages.notFound} />} />
			</Route>
		</Routes>
	);
}

export default AppRoutes;