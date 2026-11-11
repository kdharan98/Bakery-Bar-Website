import { Star } from "lucide-react";

function Rating({
	value = 0,
	max = 5,
	showValue = false,
	reviewCount,
	size = 16,
	className = "",
}) {
	const rating = Math.min(Math.max(Number(value) || 0, 0), max);

	return (
		<div
			className={`inline-flex items-center gap-2 ${className}`}
			role="img"
			aria-label={`${rating} out of ${max} stars${reviewCount == null ? "" : `, ${reviewCount} reviews`}`}
		>
			<span aria-hidden="true" className="inline-flex items-center gap-0.5">
				{Array.from({ length: max }, (_, index) => {
					const fill = Math.min(Math.max(rating - index, 0), 1) * 100;

					return (
						<span className="relative inline-flex" key={index}>
							<Star className="text-border" size={size} strokeWidth={1.6} />
							<span
								className="absolute inset-y-0 left-0 overflow-hidden text-gold"
								style={{ width: `${fill}%` }}
							>
								<Star className="max-w-none fill-gold" size={size} strokeWidth={1.6} />
							</span>
						</span>
					);
				})}
			</span>
			{showValue && <span className="text-sm font-semibold text-chocolate">{rating.toFixed(1)}</span>}
			{reviewCount != null && <span className="text-sm text-muted">({reviewCount})</span>}
		</div>
	);
}

export default Rating;