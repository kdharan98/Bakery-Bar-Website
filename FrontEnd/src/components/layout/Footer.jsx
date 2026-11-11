function Footer() {
	return (
		<footer className="border-t border-border bg-cream-secondary text-body">
			<div className="bb-container flex min-h-14 flex-col items-center justify-center gap-1 py-4 text-center text-xs text-muted sm:flex-row sm:justify-between sm:gap-4 sm:text-left">
				<p>© {new Date().getFullYear()} Bakery Bar. All rights reserved.</p>
				<p>Freshly baked, thoughtfully shared.</p>
			</div>
		</footer>
	);
}

export default Footer;
