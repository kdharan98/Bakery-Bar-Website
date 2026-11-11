import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";

function Modal({ open, title, ariaLabel, onClose, children, panelClassName = "" }) {
	const dialogRef = useRef(null);
	const closeButtonRef = useRef(null);
	const titleId = useId();
	const onCloseRef = useRef(onClose);
	const [mounted, setMounted] = useState(open);
	const [phase, setPhase] = useState("opening");

	useEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);

	useEffect(() => {
		if (open) {
			setMounted(true);
			const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			if (reducedMotion) {
				setPhase("entered");
				return undefined;
			}

			setPhase("opening");
			const frame = window.requestAnimationFrame(() => setPhase("entered"));
			return () => window.cancelAnimationFrame(frame);
		}

		if (mounted) {
			setPhase("closing");
			const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			const timeout = window.setTimeout(() => setMounted(false), reducedMotion ? 0 : 320);
			return () => window.clearTimeout(timeout);
		}

		return undefined;
	}, [open, mounted]);

	useEffect(() => {
		if (!mounted) {
			return undefined;
		}

		const previouslyFocused = document.activeElement;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = previousOverflow;
			previouslyFocused?.focus?.();
		};
	}, [mounted]);

	useEffect(() => {
		if (open && mounted) {
			closeButtonRef.current?.focus();
		}
	}, [open, mounted]);

	useEffect(() => {
		if (!mounted || !open) {
			return undefined;
		}

		function handleKeyDown(event) {
			if (event.key === "Escape") {
				onCloseRef.current();
				return;
			}

			if (event.key === "Tab") {
				const candidates = dialogRef.current?.querySelectorAll(
					'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
				);
				const focusableElements = Array.from(candidates ?? []).filter(
					(element) => !element.closest("[inert]") && element.getClientRects().length > 0,
				);
				const firstElement = focusableElements?.[0];
				const lastElement = focusableElements?.[focusableElements.length - 1];

				if (event.shiftKey && document.activeElement === firstElement) {
					event.preventDefault();
					lastElement?.focus();
				} else if (!event.shiftKey && document.activeElement === lastElement) {
					event.preventDefault();
					firstElement?.focus();
				}
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [open, mounted]);

	if (!mounted) {
		return null;
	}

	const entered = phase === "entered";

	return (
		<div
			aria-hidden={!open}
			className={`fixed inset-0 z-[60] flex cursor-pointer items-center justify-center bg-chocolate/50 p-4 backdrop-blur-[2px] transition-opacity duration-300 ease-out motion-reduce:duration-0 sm:p-6 ${entered ? "opacity-100" : "pointer-events-none opacity-0"}`}
			data-state={phase}
			onMouseDown={(event) => {
				if (open && event.target === event.currentTarget) {
					onCloseRef.current();
				}
			}}
		>
			<div
				aria-labelledby={title ? titleId : undefined}
				aria-label={title ? undefined : ariaLabel}
				aria-modal={open ? "true" : undefined}
				className={`relative max-h-[90dvh] w-full ${panelClassName || "max-w-2xl"} cursor-auto overflow-y-auto rounded-card border border-border bg-cream p-5 shadow-[var(--shadow-card)] transition-[opacity,transform] duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-0 sm:p-8 ${entered ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.98] opacity-0"}`}
				ref={dialogRef}
				role="dialog"
				tabIndex={-1}
			>
				{title ? (
					<div className="mb-6 flex items-start justify-between gap-5 border-b border-border pb-5">
						<h2 className="font-heading text-3xl font-semibold text-chocolate sm:text-4xl" id={titleId}>{title}</h2>
						<button
							aria-label="Close dialog"
							className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill text-chocolate transition-colors hover:bg-cream-secondary hover:text-burgundy"
							onClick={onClose}
							ref={closeButtonRef}
							type="button"
						>
							<X aria-hidden="true" size={21} />
						</button>
					</div>
				) : (
					<button
						aria-label="Close dialog"
						className="absolute right-3 top-3 z-20 inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-cream-secondary text-chocolate transition-colors hover:text-burgundy"
						onClick={onClose}
						ref={closeButtonRef}
						type="button"
					>
						<X aria-hidden="true" size={21} />
					</button>
				)}
				{children}
			</div>
		</div>
	);
}

export default Modal;