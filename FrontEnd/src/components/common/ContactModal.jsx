import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import contactInfo from "../../data/contactInfo.js";
import Modal from "./Modal.jsx";

const contactMethods = [
	{
		label: "Call Us",
		value: contactInfo.phone.display,
		href: contactInfo.phone.href,
		icon: Phone,
	},
	{
		label: "Email",
		value: contactInfo.email.address,
		href: contactInfo.email.href,
		icon: Mail,
	},
];

function ContactModal({ open, onClose }) {
	return (
		<Modal onClose={onClose} open={open} title="Let's Connect">
			<p className="mb-6 max-w-xl text-sm leading-6 text-muted sm:text-base">
				We'd love to hear from you. Get in touch with Bakery Bar!
			</p>
			<div className="grid gap-3 sm:grid-cols-2">
				{contactMethods.map(({ label, value, href, icon: Icon, external }) => (
					<div className="rounded-card border border-border bg-white p-4" key={label}>
						<div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-burgundy">
							<Icon aria-hidden="true" size={16} /> {label}
						</div>
						<a
							className="break-all text-sm font-semibold text-chocolate underline decoration-border underline-offset-4 transition-colors hover:text-burgundy sm:text-base"
							href={href}
							{...(external ? { rel: "noreferrer", target: "_blank" } : {})}
						>
							{value}
						</a>
						{label === "Email" && <p className="mt-2 text-xs text-muted">{contactInfo.email.status}</p>}
					</div>
				))}
				<div className="rounded-card border border-border bg-white p-4 sm:col-span-2">
					<div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-burgundy">
						<MapPin aria-hidden="true" size={16} /> Visit Our Store
					</div>
					<address className="text-sm font-semibold not-italic leading-6 text-chocolate">
						{contactInfo.address.join(", ")}
					</address>
				</div>
			</div>
			<div className="mt-5 flex flex-col gap-3 border border-border bg-cream-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h3 className="font-heading text-xl font-semibold text-chocolate">Planning a custom order?</h3>
					<p className="mt-1 text-sm text-muted">Tell us what you have in mind on WhatsApp.</p>
				</div>
				<a
					className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-burgundy px-4 text-sm font-semibold text-white transition-colors hover:bg-burgundy-dark"
					href={contactInfo.whatsapp.href}
					rel="noreferrer"
					target="_blank"
				>
					<MessageCircle aria-hidden="true" size={17} /> WhatsApp us
				</a>
			</div>
		</Modal>
	);
}

export default ContactModal;