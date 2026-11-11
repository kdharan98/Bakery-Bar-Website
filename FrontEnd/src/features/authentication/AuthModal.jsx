import Modal from "../../components/common/Modal.jsx";
import AuthForm from "./AuthForm.jsx";

function AuthModal({
	open,
	mode,
	onClose,
	onModeChange,
	onSignIn,
	onSignUp,
}) {
	return (
		<Modal
			ariaLabel="Bakery Bar sign in and account creation"
			onClose={onClose}
			open={open}
			panelClassName="max-w-5xl"
		>
			<div className="auth-flip-scene">
				<div className="auth-flip-card" data-mode={mode}>
					<AuthForm
						active={open && mode === "signin"}
						mode="signin"
						onModeChange={onModeChange}
						onSignIn={onSignIn}
						onSignUp={onSignUp}
					/>
					<AuthForm
						active={open && mode === "signup"}
						mode="signup"
						onModeChange={onModeChange}
						onSignIn={onSignIn}
						onSignUp={onSignUp}
					/>
				</div>
			</div>
		</Modal>
	);
}

export default AuthModal;
