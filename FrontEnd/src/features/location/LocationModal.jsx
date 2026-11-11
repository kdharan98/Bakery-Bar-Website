import { useEffect, useRef, useState } from "react";
import { LoaderCircle, MapPin } from "lucide-react";
import Button from "../../components/common/Button.jsx";
import Input from "../../components/common/Input.jsx";
import Modal from "../../components/common/Modal.jsx";
import { getCurrentCoordinates, getLocationErrorMessage } from "../../services/location.js";
import { validatePinCode } from "../../utils/deliveryAvailability.js";

function LocationModal({ open, onClose, selectedLocation, onConfirm, onClear }) {
	const [pinCode, setPinCode] = useState("");
	const [detecting, setDetecting] = useState(false);
	const [locationDetected, setLocationDetected] = useState(false);
	const [locationError, setLocationError] = useState("");
	const [pinError, setPinError] = useState("");
	const [availabilityResult, setAvailabilityResult] = useState(null);
	const pinInputRef = useRef(null);

	useEffect(() => {
		if (open) {
			setPinCode(selectedLocation?.pinCode || "");
			setLocationDetected(false);
			setLocationError("");
			setPinError("");
			setAvailabilityResult(null);
		} else {
			setDetecting(false);
			setPinCode("");
			setLocationDetected(false);
			setLocationError("");
			setPinError("");
			setAvailabilityResult(null);
		}
	}, [open, selectedLocation]);

	async function detectLocation() {
		setDetecting(true);
		setLocationError("");
		setLocationDetected(false);
		try {
			await getCurrentCoordinates();
			setLocationDetected(true);
		} catch (error) {
			setLocationError(getLocationErrorMessage(error));
		} finally {
			setDetecting(false);
		}
	}

	function updatePinCode(value) {
		setPinCode(value.replace(/\D/g, "").slice(0, 6));
		setPinError("");
		setAvailabilityResult(null);
	}

	function handleConfirm() {
		const validation = validatePinCode(pinCode);
		if (!validation.valid) {
			setPinError(validation.message);
			setAvailabilityResult(null);
			pinInputRef.current?.focus();
			return;
		}

		setPinError("");
		const result = onConfirm(pinCode);
		if (result.status === "unavailable") {
			setAvailabilityResult(result);
		}
	}

	function handleClear() {
		onClear();
		setPinCode("");
		setPinError("");
		setAvailabilityResult(null);
		setLocationDetected(false);
		setLocationError("");
	}

	function handleChangePinCode() {
		setPinCode("");
		setAvailabilityResult(null);
		setPinError("");
		pinInputRef.current?.focus();
	}

	return (
		<Modal onClose={onClose} open={open} title="Where should we deliver?">
			<p className="mb-6 -mt-2 text-sm leading-6 text-muted sm:text-base">
				Enter your PIN code to view the demonstration delivery estimate.
			</p>

			<Button
				className="min-h-12 w-full"
				disabled={detecting}
				onClick={detectLocation}
				size="lg"
			>
				{detecting
					? <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" size={19} />
					: <MapPin aria-hidden="true" size={19} />}
				{detecting ? "Detecting your location..." : "Use my current location"}
			</Button>

			{locationDetected && (
				<div className="mt-4 flex items-start gap-3 rounded-card border border-gold/60 bg-cream-secondary p-4" role="status">
					<MapPin aria-hidden="true" className="mt-0.5 shrink-0 text-burgundy" size={19} />
					<div>
						<p className="font-semibold text-chocolate">Current location detected</p>
						<p className="mt-1 text-sm leading-5 text-muted">
							Enter your 6-digit delivery PIN code below to check the demo estimate.
						</p>
					</div>
				</div>
			)}

			{locationError && (
				<p className="mt-4 text-sm leading-6 text-burgundy" role="alert">
					{locationError}
				</p>
			)}

			<div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.12em] text-muted">
				<span className="h-px flex-1 bg-border" />
				Or enter your PIN code
				<span className="h-px flex-1 bg-border" />
			</div>

			<div className="grid gap-5">
				<Input
					autoComplete="postal-code"
					error={pinError}
					id="delivery-pin-code"
					inputMode="numeric"
					label="Enter your delivery PIN code"
					maxLength={6}
					onBlur={() => {
						const validation = validatePinCode(pinCode);
						setPinError(validation.valid ? "" : validation.message);
					}}
					onChange={(event) => updatePinCode(event.target.value)}
					pattern="[0-9]{6}"
					placeholder="Enter 6-digit PIN code"
					ref={pinInputRef}
					required
					type="text"
					value={pinCode}
				/>

				{availabilityResult?.status === "unavailable" && (
					<div className="rounded-card border border-gold/70 bg-cream-secondary p-4" role="alert">
						<p className="font-semibold text-chocolate">{availabilityResult.message}</p>
						<button
							className="mt-2 min-h-11 text-sm font-semibold text-burgundy underline decoration-border underline-offset-4 transition-colors hover:text-burgundy-dark"
							onClick={handleChangePinCode}
							type="button"
						>
							Enter another PIN code
						</button>
					</div>
				)}

				<div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
					{selectedLocation ? (
						<button
							className="min-h-11 text-left text-sm font-semibold text-burgundy underline decoration-border underline-offset-4 transition-colors hover:text-burgundy-dark"
							onClick={handleClear}
							type="button"
						>
							Clear saved PIN code
						</button>
					) : <span aria-hidden="true" />}
					<Button onClick={handleConfirm} size="lg">
						Confirm Location
					</Button>
				</div>
			</div>
		</Modal>
	);
}

export default LocationModal;
