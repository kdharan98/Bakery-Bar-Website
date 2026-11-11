import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const COPIES = 3;

function getIsMobile() {
	return typeof window !== "undefined" && window.matchMedia("(max-width: 63.999rem)").matches;
}

function TestimonialCarousel({ testimonials }) {
	const testimonialCount = testimonials.length;
	const [centerPosition, setCenterPosition] = useState(testimonialCount);
	const [isMobile, setIsMobile] = useState(getIsMobile);
	const [isMoving, setIsMoving] = useState(false);
	const [transitionEnabled, setTransitionEnabled] = useState(true);
	const touchStartX = useRef(null);
	const repeatedTestimonials = Array.from({ length: COPIES }, () => testimonials).flat();
	const activeIndex = ((centerPosition % testimonialCount) + testimonialCount) % testimonialCount;
	const offset = isMobile ? centerPosition : centerPosition - 1;

	useEffect(() => {
		const mediaQuery = window.matchMedia("(max-width: 63.999rem)");
		const updateViewport = () => setIsMobile(mediaQuery.matches);
		mediaQuery.addEventListener("change", updateViewport);
		return () => mediaQuery.removeEventListener("change", updateViewport);
	}, []);

	function move(direction) {
		if (isMoving) {
			return;
		}

		setIsMoving(true);
		setCenterPosition((position) => position + direction);
	}

	function handleTransitionEnd(event) {
		if (event.target !== event.currentTarget || event.propertyName !== "transform") {
			return;
		}

		if (centerPosition <= 1 || centerPosition >= testimonialCount * 2 + 2) {
			setTransitionEnabled(false);
			setCenterPosition((position) => (position <= 1 ? position + testimonialCount : position - testimonialCount));
			window.requestAnimationFrame(() => {
				window.requestAnimationFrame(() => {
					setTransitionEnabled(true);
					setIsMoving(false);
				});
			});
			return;
		}

		setIsMoving(false);
	}

	function handleTouchStart(event) {
		touchStartX.current = event.touches[0]?.clientX ?? null;
	}

	function handleTouchEnd(event) {
		if (touchStartX.current === null) {
			return;
		}

		const distance = event.changedTouches[0].clientX - touchStartX.current;
		touchStartX.current = null;
		if (Math.abs(distance) > 48) {
			move(distance < 0 ? 1 : -1);
		}
	}

	return (
		<div className="mx-auto max-w-6xl">
			<div
				aria-label="Sample customer testimonials"
				aria-roledescription="carousel"
				className="overflow-hidden touch-pan-y"
				onTouchEnd={handleTouchEnd}
				onTouchStart={handleTouchStart}
			>
				<div
					className={`flex w-[1200%] desktop:w-[400%] ${transitionEnabled ? "transition-transform duration-500 ease-out" : "transition-none"}`}
					onTransitionEnd={handleTransitionEnd}
					style={{ transform: `translate3d(-${(offset / (testimonialCount * COPIES)) * 100}%, 0, 0)` }}
				>
					{repeatedTestimonials.map((testimonial, position) => {
						const isActive = position === centerPosition;
						const isVisible = isMobile
							? isActive
							: Math.abs(position - centerPosition) <= 1;

						return (
							<div
								aria-hidden={!isVisible}
								className="w-[8.333333%] shrink-0 px-2 py-4 desktop:px-3"
								key={`${position}-${testimonial.id}`}
							>
								<article
									className={`flex min-h-[290px] h-full flex-col items-center rounded-card border border-border bg-cream p-5 text-center sm:p-7 ${transitionEnabled ? "transition-[transform,opacity,box-shadow] duration-500" : "transition-none"} ${isActive ? "scale-100 opacity-100 shadow-[var(--shadow-card)]" : "scale-[0.92] opacity-70 shadow-none"}`}
									data-active={isActive}
								>
									<div aria-hidden="true" className="mb-4 flex size-14 items-center justify-center rounded-pill border border-gold/50 bg-cream-secondary font-heading text-2xl font-semibold text-burgundy">
										{testimonial.initials}
									</div>
									<div aria-label={`${testimonial.rating} out of 5 stars`} className="mb-4 flex gap-1" role="img">
										{Array.from({ length: 5 }, (_, starIndex) => (
											<Star aria-hidden="true" className="fill-gold text-gold" key={starIndex} size={16} strokeWidth={1.5} />
										))}
									</div>
									<blockquote className="flex-1 font-heading text-xl leading-snug text-chocolate sm:text-2xl">“{testimonial.quote}”</blockquote>
									<figcaption className="mt-5 border-t border-border pt-4 text-sm font-bold text-burgundy">
										{testimonial.name}
										<span className="mt-1 block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">Sample testimonial</span>
									</figcaption>
								</article>
							</div>
						);
					})}
				</div>
			</div>

			<div className="mt-5 flex items-center justify-center gap-5">
				<button
					aria-label="Previous testimonial"
					className="inline-flex size-11 items-center justify-center rounded-pill border border-border bg-white text-burgundy transition-colors hover:border-gold hover:bg-cream-secondary disabled:opacity-50"
					disabled={isMoving}
					onClick={() => move(-1)}
					type="button"
				>
					<ChevronLeft aria-hidden="true" size={20} />
				</button>
				<p aria-live="polite" className="min-w-16 text-center text-xs font-semibold tabular-nums text-muted">
					{String(activeIndex + 1).padStart(2, "0")} / {String(testimonialCount).padStart(2, "0")}
				</p>
				<button
					aria-label="Next testimonial"
					className="inline-flex size-11 items-center justify-center rounded-pill border border-border bg-white text-burgundy transition-colors hover:border-gold hover:bg-cream-secondary disabled:opacity-50"
					disabled={isMoving}
					onClick={() => move(1)}
					type="button"
				>
					<ChevronRight aria-hidden="true" size={20} />
				</button>
			</div>
			<p className="mt-4 text-center text-xs text-muted">Demonstration testimonials; not verified customer reviews.</p>
		</div>
	);
}

export default TestimonialCarousel;