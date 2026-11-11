import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";

function PasswordField({
	id,
	label,
	autoComplete = "new-password",
	value,
	error,
	visible,
	onChange,
	onToggle,
}) {
	return (
		<div className="relative">
			<Input
				autoComplete={autoComplete}
				className="pr-12"
				error={error}
				id={id}
				label={label}
				onChange={onChange}
				required
				type={visible ? "text" : "password"}
				value={value}
			/>
			<button
				aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
				className="absolute right-2 top-[2.35rem] inline-flex size-9 items-center justify-center rounded-pill text-muted transition-colors hover:bg-cream-secondary hover:text-burgundy"
				onClick={onToggle}
				type="button"
			>
				{visible ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
			</button>
		</div>
	);
}

function AuthForm({
	mode,
	active,
	onModeChange,
	onSignIn,
	onSignUp,
}) {
	const isSignUp = mode === "signup";
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [fieldErrors, setFieldErrors] = useState({});
	const [formError, setFormError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (!active) {
			setPassword("");
			setConfirmPassword("");
			setShowPassword(false);
			setShowConfirmPassword(false);
			setFieldErrors({});
			setFormError("");
			return;
		}

		setPassword("");
		setConfirmPassword("");
		setShowPassword(false);
		setShowConfirmPassword(false);
		setFieldErrors({});
		setFormError("");
	}, [active]);

	function updateUsername(event) {
		setUsername(event.target.value);
		setFieldErrors((current) => ({ ...current, username: "" }));
		setFormError("");
	}

	function updatePassword(event) {
		setPassword(event.target.value);
		setFieldErrors((current) => ({ ...current, password: "" }));
		setFormError("");
	}

	async function handleSubmit(event) {
		event.preventDefault();
		setFormError("");
		const nextErrors = {};
		if (!username.trim()) {
			nextErrors.username = "Enter your username.";
		}
		if (!password) {
			nextErrors.password = "Enter your password.";
		}
		if (isSignUp && !confirmPassword) {
			nextErrors.confirmPassword = "Confirm your password.";
		}
		if (isSignUp && password && confirmPassword && password !== confirmPassword) {
			nextErrors.confirmPassword = "Passwords do not match.";
		}
		if (Object.keys(nextErrors).length > 0) {
			setFieldErrors(nextErrors);
			return;
		}

		setSubmitting(true);
		try {
			const result = isSignUp
				? await onSignUp(username.trim(), password)
				: await onSignIn(username.trim(), password);
			if (!result.success) {
				if (result.field) {
					setFieldErrors((current) => ({ ...current, [result.field]: result.message }));
				} else {
					setFormError(result.message);
				}
			}
		} catch (error) {
			console.error("Could not complete the authentication form.", error);
			setFormError("We couldn't complete that request. Please try again.");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<section
			aria-hidden={!active}
			className={`auth-flip-face ${isSignUp ? "auth-flip-face--signup" : "auth-flip-face--signin"}`}
			data-active={active}
			inert={!active}
		>
			<div className={`auth-form-visual ${isSignUp ? "auth-signup-visual" : ""}`}>
				<img
					alt={isSignUp ? "Baker preparing fresh pastries" : "A warm coffee beside a freshly baked treat"}
					className="absolute inset-0 h-full w-full object-cover"
					src={isSignUp ? "/images/auth/auth-signup-baking.png" : "/images/auth/auth-signin-coffee.png"}
				/>
				<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-chocolate/85 to-transparent px-5 pb-5 pt-12 text-white sm:px-7">
					<p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/85">
						{isSignUp ? "A little joy, made by hand" : "A little warmth, whenever you need it"}
					</p>
				</div>
			</div>

			<div className={`auth-form-panel ${isSignUp ? "auth-signup-panel" : ""}`}>
				<div className="mb-5">
					<p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-burgundy">
						{isSignUp ? "Become part of our table" : "It’s lovely to see you again"}
					</p>
					<h2 className="font-heading text-3xl font-semibold leading-tight text-chocolate sm:text-4xl">
						{isSignUp ? "Join Our Family" : "Welcome Back"}
					</h2>
					<p className="mt-2 text-sm leading-6 text-muted">
						{isSignUp
							? "Create your Bakery Bar account."
							: "Sign in to continue your Bakery Bar experience."}
					</p>
				</div>

				<form className="grid gap-4" onSubmit={handleSubmit}>
					<Input
						autoComplete="username"
						error={fieldErrors.username}
						id={`auth-username-${mode}`}
						label="Username"
						onChange={updateUsername}
						required
						value={username}
					/>
					<PasswordField
						autoComplete={isSignUp ? "new-password" : "current-password"}
						error={fieldErrors.password}
						id={`auth-password-${mode}`}
						label="Password"
						onChange={updatePassword}
						onToggle={() => setShowPassword((visible) => !visible)}
						value={password}
						visible={showPassword}
					/>
					{isSignUp && (
						<PasswordField
							autoComplete="new-password"
							error={fieldErrors.confirmPassword}
							id="auth-confirm-password"
							label="Confirm Password"
							onChange={(event) => {
								setConfirmPassword(event.target.value);
								setFieldErrors((current) => ({ ...current, confirmPassword: "" }));
							}}
							onToggle={() => setShowConfirmPassword((visible) => !visible)}
							value={confirmPassword}
							visible={showConfirmPassword}
						/>
					)}
					{formError && <p className="text-sm leading-5 text-burgundy" role="alert">{formError}</p>}
					<Button className="mt-1 w-full" disabled={submitting} size="lg" type="submit">
						{submitting
							? (isSignUp ? "Creating account..." : "Signing in...")
							: (isSignUp ? "Create Account" : "Sign In")}
					</Button>
				</form>

				<p className="mt-5 text-center text-sm text-muted">
					{isSignUp ? "Already a member? " : "New to Bakery Bar? "}
					<button
						className="font-semibold text-burgundy underline decoration-burgundy/30 underline-offset-4 transition-colors hover:text-burgundy-dark"
						onClick={() => onModeChange(isSignUp ? "signin" : "signup")}
						type="button"
					>
						{isSignUp ? "Sign In." : "Create an account."}
					</button>
				</p>
			</div>
		</section>
	);
}

export default AuthForm;