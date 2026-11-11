function SectionTitle({
	id,
	title,
	subtitle,
	eyebrow,
	align = "left",
	className = "",
}) {
	const alignment = align === "center" ? "items-center text-center" : "items-start text-left";

	return (
		<div className={`flex flex-col gap-3 ${alignment} ${className}`}>
			{eyebrow && (
				<span className="text-xs font-bold uppercase tracking-[0.16em] text-burgundy">
					{eyebrow}
				</span>
			)}
			<h2 className="font-heading text-3xl text-chocolate sm:text-4xl" id={id}>{title}</h2>
			{subtitle && <p className="max-w-2xl text-base text-muted">{subtitle}</p>}
		</div>
	);
}

export default SectionTitle;