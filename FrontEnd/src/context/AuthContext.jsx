import { createContext, useContext, useRef, useState } from "react";
import {
	clearSession,
	createDemoAccount,
	findDemoAccount,
	normalizeUsername,
	readRegisteredAccounts,
	readSavedUsername,
	saveRegisteredAccounts,
	saveSession,
	verifyDemoPassword,
} from "../services/demoAuth.js";

const AuthContext = createContext(null);

function readAuthState() {
	const accounts = readRegisteredAccounts();
	const savedUsername = readSavedUsername();
	const account = savedUsername ? findDemoAccount(savedUsername, accounts) : null;
	if (savedUsername && !account) {
		try {
			clearSession();
		} catch (error) {
			console.error("Could not clear an invalid demo session.", error);
		}
	}

	return {
		accounts,
		user: account ? { username: account.username } : null,
	};
}

export function AuthProvider({ children }) {
	const [authState, setAuthState] = useState(readAuthState);
	const [authModalOpen, setAuthModalOpen] = useState(false);
	const [authMode, setAuthMode] = useState("signin");
	const [authNotice, setAuthNotice] = useState("");
	const pendingCartActionRef = useRef(null);

	function openAuthModal(mode = "signin") {
		setAuthMode(mode === "signup" ? "signup" : "signin");
		setAuthModalOpen(true);
	}

	function closeAuthModal() {
		pendingCartActionRef.current = null;
		setAuthModalOpen(false);
		setAuthMode("signin");
	}

	function changeAuthMode(mode) {
		setAuthMode(mode === "signup" ? "signup" : "signin");
	}

	function runPendingCartAction() {
		const action = pendingCartActionRef.current;
		pendingCartActionRef.current = null;
		action?.();
	}

	function completeAuthentication(account, nextAccounts) {
		try {
			if (nextAccounts) {
				saveRegisteredAccounts(nextAccounts);
			}
			saveSession(account.username);
		} catch (error) {
			console.error("Could not save demo authentication data.", error);
			return {
				success: false,
				message: "We couldn't save your sign-in. Please try again.",
			};
		}

		setAuthState((current) => ({
			accounts: nextAccounts ?? current.accounts,
			user: { username: account.username },
		}));
		setAuthModalOpen(false);
		setAuthMode("signin");
		runPendingCartAction();
		return { success: true };
	}

	async function signIn(username, password) {
		const account = findDemoAccount(username.trim(), authState.accounts);
		if (!account || !password) {
			return { success: false, message: "Username or password is incorrect." };
		}

		try {
			const passwordMatches = await verifyDemoPassword(account, password);
			if (!passwordMatches) {
				return { success: false, message: "Username or password is incorrect." };
			}
		} catch (error) {
			console.error("Could not verify demo credentials.", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "Sign in is unavailable right now.",
			};
		}

		return completeAuthentication(account);
	}

	async function signUp(username, password) {
		const normalizedUsername = normalizeUsername(username);
		if (!normalizedUsername || !password) {
			return { success: false, message: "Enter a username and password to continue." };
		}

		if (findDemoAccount(normalizedUsername, authState.accounts)) {
			return {
				success: false,
				field: "username",
				message: "That username is already registered.",
			};
		}

		try {
			const account = await createDemoAccount(username.trim(), password);
			const nextAccounts = [...authState.accounts, account];
			const result = completeAuthentication(account, nextAccounts);
			if (result.success) {
				setAuthNotice(`Account created successfully. Welcome, ${account.username}!`);
			}
			return result;
		} catch (error) {
			console.error("Could not create demo account.", error);
			return {
				success: false,
				message: error instanceof Error ? error.message : "We couldn't create your account.",
			};
		}
	}

	function signOut() {
		try {
			clearSession();
		} catch (error) {
			console.error("Could not clear demo sign-in session.", error);
			return { success: false };
		}

		pendingCartActionRef.current = null;
		setAuthState((current) => ({ ...current, user: null }));
		setAuthNotice("");
		return { success: true };
	}

	function runCartAction(action) {
		if (authState.user) {
			action();
			return;
		}

		if (!pendingCartActionRef.current) {
			pendingCartActionRef.current = action;
		}
		openAuthModal("signin");
	}

	return (
		<AuthContext.Provider
			value={{
				user: authState.user,
				authModalOpen,
				authMode,
				authNotice,
				openAuthModal,
				closeAuthModal,
				changeAuthMode,
				dismissAuthNotice: () => setAuthNotice(""),
				runCartAction,
				signIn,
				signUp,
				signOut,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
}