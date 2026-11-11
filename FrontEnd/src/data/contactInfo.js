const phone = "099438 82203";
const internationalDigits = phone.replace(/\D/g, "").replace(/^0/, "");
const email = "info.bakerybar@gmail.com";

const contactInfo = {
	phone: {
		display: phone,
		href: `tel:+91${internationalDigits}`,
	},
	whatsapp: {
		display: phone,
		href: `https://wa.me/91${internationalDigits}`,
	},
	email: {
		address: email,
		href: `mailto:${email}`,
		status: "Provisional; pending owner confirmation.",
	},
	address: ["Rajalakshmi Nagar", "Dindigul", "Tamil Nadu – 624003"],
	hours: "8:30 AM to 9:30 PM",
};

export default contactInfo;