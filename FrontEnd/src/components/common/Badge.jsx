const variants = {
	category: "bg-cream-secondary text-chocolate",
	status: "bg-burgundy text-white",
	success: "bg-cream-secondary text-burgundy",
	neutral: "bg-cream text-muted",
};

function Badge({ children, variant = "category", className = "" }) {
	return (
		<span
			className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-semibold tracking-wide ${variants[variant] ?? variants.category} ${className}`}
		>
			{children}
		</span>
	);
}

export default Badge;