import { useState } from "react";
import {
	ArrowDown,
	ArrowRight,
	Clock,
	Heart,
	Leaf,
	Mail,
	MapPin,
	MessageCircle,
	Phone,
	Sparkles,
	Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import SectionTitle from "../components/ui/SectionTitle.jsx";
import TestimonialCarousel from "../components/ui/TestimonialCarousel.jsx";
import ProductGrid from "../features/products/ProductGrid.jsx";
import categories from "../data/categories.js";
import products from "../data/products.js";
import testimonials from "../data/testimonials.js";
import contactInfo from "../data/contactInfo.js";
import { WHATSAPP_ENQUIRY_STATUS } from "../utils/constants.js";

const benefits = [
	{ title: "Crafted with Care", icon: Sparkles },
	{ title: "Quality Ingredients", icon: Leaf },
	{ title: "Custom Creations", icon: Heart },
	{ title: "Reliable Delivery", icon: Truck },
];

const categoryCurveOffsets = [
	"desktop:translate-y-0",
	"desktop:translate-y-[clamp(0px,1.67vw,24px)]",
	"desktop:translate-y-[clamp(0px,2.78vw,40px)]",
	"desktop:translate-y-[clamp(0px,3.33vw,48px)]",
	"desktop:translate-y-[clamp(0px,2.78vw,40px)]",
	"desktop:translate-y-[clamp(0px,1.67vw,24px)]",
	"desktop:translate-y-0",
];

function HomePage() {
	const [enquiryStatus, setEnquiryStatus] = useState("");

	function handleEnquirySubmit(event) {
		event.preventDefault();
		const form = event.currentTarget;
		if (!form.reportValidity()) {
			return;
		}

		const formData = new FormData(form);
		const name = String(formData.get("name") ?? "").trim();
		const email = String(formData.get("email") ?? "").trim();
		const message = String(formData.get("message") ?? "").trim();

		if (!name || !email || !message) {
			setEnquiryStatus("Please complete your name, email address and message.");
			return;
		}

		const enquiry = `Bakery Bar enquiry\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`;
		const whatsappUrl = `${contactInfo.whatsapp.href}?text=${encodeURIComponent(enquiry)}`;
		const whatsappWindow = window.open(whatsappUrl, "_blank");

		if (!whatsappWindow) {
			setEnquiryStatus("WhatsApp could not be opened. Please allow pop-ups or use the WhatsApp contact link above.");
			return;
		}

		whatsappWindow.opener = null;
		setEnquiryStatus(WHATSAPP_ENQUIRY_STATUS);
	}

	function scrollToCreations() {
		document.getElementById("creations")?.scrollIntoView({ behavior: "smooth" });
	}

	return (
		<div>
			<section aria-labelledby="hero-title" className="bb-home-hero relative flex min-h-[calc(100svh-76px)] items-center overflow-hidden py-12 desktop:min-h-[calc(100svh-92px)] desktop:py-16">
				<div className="bb-container relative z-10 grid items-center">
					<div className="max-w-[16rem] py-8 sm:py-12 desktop:max-w-2xl desktop:py-16">
						<p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-burgundy">YOUR FRIENDLY NEIGHBORHOOD BAKERY</p>
						<h1 className="max-w-xl font-heading text-5xl font-medium leading-[0.98] text-chocolate sm:text-6xl desktop:text-7xl" id="hero-title">
							Bakery Bar,<br />
							<span className="italic text-burgundy">baked fresh.</span>
						</h1>
						<p className="mt-6 max-w-lg text-base leading-7 text-chocolate/85 sm:text-lg">
							Thoughtful bakes, joyful little rituals, and something lovely for every table.
						</p>
						<div className="mt-8 flex flex-wrap items-center gap-3">
							<Button onClick={scrollToCreations} size="lg">Explore Our Creations <ArrowDown aria-hidden="true" size={17} /></Button>
						</div>
						<div className="mt-10 flex items-center gap-3 border-t border-burgundy/20 pt-5 text-sm text-chocolate/75">
							<span className="h-px w-9 bg-gold" />
							Made fresh for the moments that matter
						</div>
					</div>
				</div>
			</section>

			<section aria-labelledby="creations-title" className="bg-white py-16 sm:py-20" id="creations">
				<div className="bb-container">
					<div className="mb-8 flex flex-wrap items-end justify-between gap-5 sm:mb-10">
						<SectionTitle id="creations-title" eyebrow="From our ovens and kitchen" title="Our Creations" subtitle="A little something for every craving, celebration and in-between moment." />
						<Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-burgundy hover:text-burgundy-dark" to="/products">
							Browse all <ArrowRight aria-hidden="true" size={16} />
						</Link>
					</div>
					<div className="bb-category-curve relative grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-5 desktop:grid-cols-7 desktop:gap-x-2 desktop:gap-y-0">
						<svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 hidden h-[clamp(7rem,10vw,9rem)] w-full desktop:block" preserveAspectRatio="none" viewBox="0 0 1000 144">
							<path d="M 72 72 Q 143 72 214 96 T 357 112 T 500 120 T 643 112 T 786 96 T 928 72" fill="none" stroke="var(--brand-gold)" strokeWidth="1.25" />
							<g fill="var(--brand-cream)" stroke="var(--brand-gold)" strokeWidth="1.25">
								<circle cx="143" cy="82" r="3" />
								<circle cx="285" cy="104" r="3" />
								<circle cx="428" cy="116" r="3" />
								<circle cx="572" cy="116" r="3" />
								<circle cx="714" cy="104" r="3" />
								<circle cx="857" cy="82" r="3" />
							</g>
						</svg>
						{categories.map((category, index) => (
							<Link
								className={`group relative z-10 flex min-w-0 flex-col items-center text-center desktop:transition-transform ${categoryCurveOffsets[index]}`}
								key={category.slug}
								to={`/products?category=${category.slug}`}
							>
								<span className="block size-28 overflow-hidden rounded-pill border border-gold/40 bg-cream-secondary shadow-[var(--shadow-card)] transition-transform duration-300 group-hover:scale-[1.04] desktop:size-28 wide:size-36">
									<img alt="" aria-hidden="true" className="h-full w-full object-cover" loading="lazy" src={category.image} />
								</span>
								<span className="mt-3 max-w-full font-heading text-lg font-semibold leading-tight text-chocolate sm:text-xl">{category.name}</span>
							</Link>
						))}
					</div>
				</div>
			</section>

			<section aria-labelledby="favourites-title" className="bg-cream-secondary py-16 sm:py-20">
				<div className="bb-container">
					<div className="mb-8 flex flex-wrap items-end justify-between gap-5 sm:mb-10">
						<div>
							<SectionTitle id="favourites-title" eyebrow="A few much-loved bakes" title="Customer Favourites" subtitle="A few much-loved bakes." />
						</div>
						<Link className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-burgundy hover:text-burgundy-dark" to="/products">
							See the collection <ArrowRight aria-hidden="true" size={16} />
						</Link>
					</div>
						<ProductGrid
							products={products
								.filter((product) => product.active && product.featured)
								.sort((first, second) => first.featuredOrder - second.featuredOrder)}
							variant="showcase"
						/>
				</div>
			</section>

			<section aria-labelledby="story-title" className="scroll-mt-24 bg-cream py-16 sm:py-20 desktop:scroll-mt-28" id="story">
				<div className="bb-container grid items-center gap-8 desktop:grid-cols-2 desktop:gap-14">
					<div className="overflow-hidden rounded-card">
						<img alt="A red velvet cake displayed on a stand" className="aspect-[5/4] w-full object-cover" loading="lazy" src="/images/story/our-story.png" />
					</div>
					<div className="py-2">
						<SectionTitle id="story-title" eyebrow="A little about us" title="Our Story" subtitle="Bakery Bar is a place for the familiar comfort of a good bake and the delight of discovering a new favourite. We make cakes, treats and everyday staples to bring people together around the table." />
						<h3 className="mt-8 font-heading text-2xl font-semibold text-chocolate">Why Choose Bakery Bar</h3>
						<div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
							{benefits.map(({ title, icon: Icon }) => (
								<div className="flex items-center gap-3 border-t border-border pt-4" key={title}>
									<span className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-cream-secondary text-burgundy"><Icon aria-hidden="true" size={19} strokeWidth={1.7} /></span>
									<h3 className="font-heading text-xl font-semibold text-chocolate">{title}</h3>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			<section aria-labelledby="testimonials-title" className="border-y border-border bg-white py-16 sm:py-20">
				<div className="bb-container">
					<div className="mb-8 sm:mb-10">
						<SectionTitle id="testimonials-title" align="center" eyebrow="Words around the table" title="A Taste of What’s to Come" subtitle="Demonstration testimonials for preview only; these are not verified customer reviews." />
					</div>
					<TestimonialCarousel testimonials={testimonials} />
				</div>
			</section>

			<section aria-labelledby="contact-title" className="bg-cream-secondary py-8 sm:py-10" id="contact">
				<div className="bb-container grid gap-6 desktop:grid-cols-[1.05fr_0.95fr] desktop:items-center desktop:gap-10">
					<div className="flex min-w-0 flex-col">
						<div className="aspect-[16/10] max-h-[380px] w-full overflow-hidden rounded-card">
							<img alt="The Bakery Bar storefront, with its warm display windows and outdoor seating" className="h-full w-full object-cover" loading="lazy" src="/images/story/bakery-storefront.png" />
						</div>
						<div className="mt-4 grid min-w-0 grid-cols-1 gap-x-6 gap-y-3 text-sm text-muted sm:grid-cols-2">
							<div className="flex min-w-0 items-start gap-2">
								<Phone aria-hidden="true" className="mt-0.5 shrink-0 text-burgundy" size={16} />
								<div className="min-w-0"><span className="block text-xs font-semibold uppercase tracking-wide text-chocolate">Mobile number</span><a className="font-medium transition-colors hover:text-burgundy" href={contactInfo.phone.href}>{contactInfo.phone.display}</a></div>
							</div>
							<div className="flex min-w-0 items-start gap-2">
								<MessageCircle aria-hidden="true" className="mt-0.5 shrink-0 text-burgundy" size={16} />
								<div className="min-w-0"><span className="block text-xs font-semibold uppercase tracking-wide text-chocolate">WhatsApp</span><a className="font-medium transition-colors hover:text-burgundy" href={contactInfo.whatsapp.href} rel="noreferrer" target="_blank">{contactInfo.whatsapp.display}</a></div>
							</div>
							<div className="flex min-w-0 items-start gap-2">
								<Mail aria-hidden="true" className="mt-0.5 shrink-0 text-burgundy" size={16} />
								<div className="min-w-0"><span className="block text-xs font-semibold uppercase tracking-wide text-chocolate">Email</span><a className="break-all font-medium transition-colors hover:text-burgundy" href={contactInfo.email.href}>{contactInfo.email.address}</a></div>
							</div>
							<div className="flex min-w-0 items-start gap-2">
								<Clock aria-hidden="true" className="mt-0.5 shrink-0 text-burgundy" size={16} />
								<div><span className="block text-xs font-semibold uppercase tracking-wide text-chocolate">Store timings</span><span className="font-medium">{contactInfo.hours}</span></div>
							</div>
							<address className="flex min-w-0 items-start gap-2 not-italic sm:col-span-2">
								<MapPin aria-hidden="true" className="mt-0.5 shrink-0 text-burgundy" size={16} />
								<div className="min-w-0"><span className="block text-xs font-semibold uppercase tracking-wide text-chocolate">Store address</span><span className="font-medium sm:whitespace-nowrap">{contactInfo.address.join(", ")}</span></div>
							</address>
						</div>
					</div>
					<div className="rounded-card border border-border bg-white p-4 sm:p-5">
						<SectionTitle id="contact-title" eyebrow="We’d love to hear from you" title="Get in Touch" subtitle="Have a question or a celebration in mind? Leave your details below." />
						<form className="mt-5 grid gap-3" onSubmit={handleEnquirySubmit}>
							<Input autoComplete="name" id="enquiry-name" label="Your name" minLength={2} name="name" placeholder="Name" required />
							<Input autoComplete="email" id="enquiry-email" label="Email address" name="email" placeholder="you@example.com" required type="email" />
							<div className="grid gap-2">
								<label className="text-sm font-semibold text-chocolate" htmlFor="enquiry-message">Your message <span aria-hidden="true">*</span></label>
								<textarea className="min-h-24 w-full resize-y rounded-control border border-border bg-white px-3 py-2 text-body outline-none transition-colors placeholder:text-muted focus:border-burgundy focus:ring-2 focus:ring-burgundy/15" id="enquiry-message" minLength={10} name="message" placeholder="Tell us a little about your enquiry" required />
							</div>
							<Button className="w-full sm:w-fit" type="submit">Review Enquiry <ArrowRight aria-hidden="true" size={16} /></Button>
							<p aria-live="polite" className="text-xs text-muted" role="status">{enquiryStatus}</p>
						</form>
					</div>
				</div>
			</section>
		</div>
	);
}

export default HomePage;