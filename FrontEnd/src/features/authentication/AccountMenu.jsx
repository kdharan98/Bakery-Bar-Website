import { useEffect, useRef, useState } from "react";
import { UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

function AccountMenu({ onSignOut }) {
	const { user, openAuthModal } = useAuth();
	const [menuOpen, setMenuOpen] = useState(false);
	const [signOutError, setSignOutError] = useState("");
	const menuRef = useRef(null);
	const triggerRef = useRef(null);

	useEffect(() => {
		if (!menuOpen) {
			return undefined;
		}

		function handlePointerDown(event) {
			if (!menuRef.current?.contains(event.target)) {
				setMenuOpen(false);
			}
		}

		function handleKeyDown(event) {
			if (event.key === "Escape") {
				setMenuOpen(false);
				triggerRef.current?.focus();
			}
		}

		document.addEventListener("mousedown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [menuOpen]);

	function handleTriggerClick() {
		if (!user) {
			openAuthModal("signin");
			return;
		}

		setSignOutError("");
		setMenuOpen((open) => !open);
	}

	function handleSignOut() {
		const result = onSignOut();
		if (!result.success) {
			setSignOutError("We couldn't sign you out. Please try again.");
			return;
		}

		setSignOutError("");
		setMenuOpen(false);
	}

	return (
		<div className="relative hidden desktop:block" ref={menuRef}>
			<button
				aria-expanded={user ? menuOpen : undefined}
				aria-haspopup={user ? "menu" : undefined}
				aria-label={user ? `Account menu for ${user.username}` : "Sign in to your account"}
				className="inline-flex size-11 items-center justify-center text-chocolate transition-colors hover:text-burgundy"
				onClick={handleTriggerClick}
				ref={triggerRef}
				type="button"
			>
				<UserRound aria-hidden="true" size={19} strokeWidth={1.7} />
			</button>
			{user && menuOpen && (
				<div
					aria-label="Account options"
					className="absolute right-0 top-full z-50 mt-2 grid w-64 gap-1 rounded-control border border-border bg-white p-2 shadow-[var(--shadow-card)]"
					role="menu"
				>
					<p className="px-3 py-2 text-sm text-muted">Welcome, <span className="font-semibold text-chocolate">{user.username}</span></p>
					<Link
						className="rounded-control px-3 py-2 text-sm font-semibold text-chocolate transition-colors hover:bg-cream hover:text-burgundy"
						onClick={() => setMenuOpen(false)}
						role="menuitem"
						to="/orders"
					>
						My Orders
					</Link>
					<button
						className="rounded-control px-3 py-2 text-left text-sm font-semibold text-chocolate transition-colors hover:bg-cream hover:text-burgundy"
						onClick={handleSignOut}
						role="menuitem"
						type="button"
					>
						Sign Out
					</button>
					{signOutError && <p className="px-3 py-1 text-xs text-burgundy" role="alert">{signOutError}</p>}
				</div>
			)}
		</div>
	);
}

export default AccountMenu;
