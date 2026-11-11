function Input({
	id,
	label,
	hint,
	error,
	className = "",
	...inputProps
}) {
	const describedBy = [hint && `${id}-hint`, error && `${id}-error`]
		.filter(Boolean)
		.join(" ");

	return (
		<div className="grid gap-2">
			{label && (
				<label className="text-sm font-semibold text-chocolate" htmlFor={id}>
					{label}
					{inputProps.required && <span aria-hidden="true"> *</span>}
				</label>
			)}
			<input
				className={`min-h-11 w-full rounded-control border border-border bg-white px-3 text-body outline-none transition-colors placeholder:text-muted focus:border-burgundy focus:ring-2 focus:ring-burgundy/15 ${error ? "border-burgundy" : ""} ${className}`}
				id={id}
				aria-invalid={Boolean(error)}
				aria-describedby={describedBy || undefined}
				{...inputProps}
			/>
			{hint && (
				<p className="text-sm text-muted" id={`${id}-hint`}>
					{hint}
				</p>
			)}
			{error && (
				<p className="text-sm text-burgundy" id={`${id}-error`} role="alert">
					{error}
				</p>
			)}
		</div>
	);
}

export default Input;