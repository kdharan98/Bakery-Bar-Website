const variants = {
	primary:
		"border border-burgundy bg-burgundy text-white hover:border-burgundy-dark hover:bg-burgundy-dark",
	secondary:
		"border border-cream-secondary bg-cream-secondary text-chocolate hover:border-gold hover:bg-[#f2deca]",
	outline:
		"border border-burgundy bg-transparent text-burgundy hover:bg-burgundy hover:text-white",
};

const sizes = {
	sm: "min-h-9 px-4 text-sm",
	md: "min-h-11 px-5 text-sm",
	lg: "min-h-12 px-7 text-base",
};

function Button({
	children,
	variant = "primary",
	size = "md",
	type = "button",
	className = "",
	disabled = false,
	...props
}) {
	return (
		<button
			className={`inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`}
			type={type}
			disabled={disabled}
			{...props}
		>
			{children}
		</button>
	);
}

export default Button;