import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

function ScrollToTop() {
	const location = useLocation();
	const navigationType = useNavigationType();
	const routeParams = new URLSearchParams(location.search);
	routeParams.delete("search");
	routeParams.sort();
	const routeKey = `${location.pathname}?${routeParams.toString()}`;
	const previousRouteKey = useRef(routeKey);
	const previousLocationKey = useRef(location.key);
	const isInitialRender = useRef(true);

	useLayoutEffect(() => {
		const previousScrollRestoration = window.history.scrollRestoration;
		window.history.scrollRestoration = "manual";
		return () => {
			window.history.scrollRestoration = previousScrollRestoration;
		};
	}, []);

	useLayoutEffect(() => {
		const routeChanged = previousRouteKey.current !== routeKey;
		const returnedThroughHistory = navigationType === "POP"
			&& previousLocationKey.current !== location.key;

		if (isInitialRender.current || routeChanged || returnedThroughHistory) {
			const root = document.documentElement;
			const previousScrollBehavior = root.style.scrollBehavior;
			root.style.scrollBehavior = "auto";
			window.scrollTo(0, 0);
			root.style.scrollBehavior = previousScrollBehavior;
		}

		isInitialRender.current = false;
		previousRouteKey.current = routeKey;
		previousLocationKey.current = location.key;
	}, [location.key, navigationType, routeKey]);

	return null;
}

export default ScrollToTop;
