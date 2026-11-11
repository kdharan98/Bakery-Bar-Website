import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import ContactModal from "../common/ContactModal.jsx";
import Footer from "./Footer.jsx";
import Header from "./Header.jsx";

function MainLayout({ children }) {
	const [contactOpen, setContactOpen] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();

	function handleAboutClick() {
		if (location.pathname === "/") {
			document.getElementById("story")?.scrollIntoView({ behavior: "smooth", block: "start" });
			return;
		}

		navigate("/");
	}

	function handleHomeClick() {
		if (location.pathname === "/") {
			window.scrollTo({ top: 0, behavior: "smooth" });
			return;
		}

		navigate("/");
	}

	return (
		<div className="flex min-h-screen flex-col">
			<Header onHomeClick={handleHomeClick} onAboutClick={handleAboutClick} onContactClick={() => setContactOpen(true)} />
			<main className="flex-1" id="main-content">
				{children ?? <Outlet />}
			</main>
			<Footer onHomeClick={handleHomeClick} onAboutClick={handleAboutClick} onContactClick={() => setContactOpen(true)} />
			<ContactModal onClose={() => setContactOpen(false)} open={contactOpen} />
		</div>
	);
}

export default MainLayout;