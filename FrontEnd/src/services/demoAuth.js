const ACCOUNTS_STORAGE_KEY = "bakery-bar-demo-accounts";
const SESSION_STORAGE_KEY = "bakery-bar-demo-session";
const PBKDF2_ITERATIONS = 120000;

// Frontend demonstration credentials only; this is not production authentication.
export const DEFAULT_DEMO_ACCOUNT = Object.freeze({
	username: "user",
	salt: "6f2de0fdb68d4c4a922da3cf01766af2",
	passwordHash: "4db176f5dc34bb9c1d4f66a412a1dedab4ad40c49ecdfe898c48ac72de06611d",
});

export function normalizeUsername(username) {
	return username.trim().toLowerCase();
}

function isCredentialRecord(value) {
	return value
		&& typeof value === "object"
		&& typeof value.username === "string"
		&& value.username.trim().length > 0
		&& typeof value.salt === "string"
		&& /^[a-f\d]{32}$/i.test(value.salt)
		&& typeof value.passwordHash === "string"
		&& /^[a-f\d]{64}$/i.test(value.passwordHash);
}

export function readRegisteredAccounts() {
	if (typeof window === "undefined") {
		return [];
	}

	try {
		const storedAccounts = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
		if (!storedAccounts) {
			return [];
		}

		const parsedAccounts = JSON.parse(storedAccounts);
		if (!Array.isArray(parsedAccounts)) {
			console.warn("Saved demo accounts are not an array.");
			return [];
		}

		const validAccounts = parsedAccounts.filter(isCredentialRecord);
		if (validAccounts.length !== parsedAccounts.length) {
			console.warn("Invalid entries were discarded from saved demo accounts.");
		}

		return validAccounts.map(({ username, salt, passwordHash }) => ({
			username: username.trim(),
			salt: salt.toLowerCase(),
			passwordHash: passwordHash.toLowerCase(),
		}));
	} catch (error) {
		console.error("Could not read saved demo accounts.", error);
		return [];
	}
}

export function readSavedUsername() {
	if (typeof window === "undefined") {
		return null;
	}

	try {
		const storedSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
		if (!storedSession) {
			return null;
		}

		const parsedSession = JSON.parse(storedSession);
		if (typeof parsedSession?.username !== "string" || !parsedSession.username.trim()) {
			console.warn("Invalid saved demo session was discarded.");
			return null;
		}

		return parsedSession.username.trim();
	} catch (error) {
		console.error("Could not read saved demo session.", error);
		return null;
	}
}

export function saveRegisteredAccounts(accounts) {
	const safeAccounts = accounts.map(({ username, salt, passwordHash }) => ({
		username,
		salt,
		passwordHash,
	}));
	window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(safeAccounts));
}

export function saveSession(username) {
	window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ username }));
}

export function clearSession() {
	window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function findDemoAccount(username, registeredAccounts) {
	const normalizedUsername = normalizeUsername(username);
	if (normalizedUsername === DEFAULT_DEMO_ACCOUNT.username) {
		return DEFAULT_DEMO_ACCOUNT;
	}

	return registeredAccounts.find(
		(account) => normalizeUsername(account.username) === normalizedUsername,
	) ?? null;
}

function bytesToHex(bytes) {
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
	return new Uint8Array(hex.match(/.{2}/g).map((byte) => Number.parseInt(byte, 16)));
}

async function hashPassword(password, salt) {
	const cryptoApi = globalThis.crypto;
	if (!cryptoApi?.subtle) {
		throw new Error("Secure password storage is unavailable in this browser.");
	}

	const keyMaterial = await cryptoApi.subtle.importKey(
		"raw",
		new TextEncoder().encode(password),
		"PBKDF2",
		false,
		["deriveBits"],
	);
	const bits = await cryptoApi.subtle.deriveBits(
		{
			name: "PBKDF2",
			salt: hexToBytes(salt),
			iterations: PBKDF2_ITERATIONS,
			hash: "SHA-256",
		},
		keyMaterial,
		256,
	);

	return bytesToHex(new Uint8Array(bits));
}

export async function createDemoAccount(username, password) {
	const cryptoApi = globalThis.crypto;
	if (!cryptoApi?.getRandomValues) {
		throw new Error("Secure password storage is unavailable in this browser.");
	}

	const saltBytes = cryptoApi.getRandomValues(new Uint8Array(16));
	const salt = bytesToHex(saltBytes);
	return {
		username,
		salt,
		passwordHash: await hashPassword(password, salt),
	};
}

export async function verifyDemoPassword(account, password) {
	const passwordHash = await hashPassword(password, account.salt);
	return passwordHash === account.passwordHash;
}
