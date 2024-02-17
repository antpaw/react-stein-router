import debug from "debug";
import { FC, useContext, useEffect } from "react";
import { RouterError } from "./RouterError";
import { RouterSwitchContext } from "./RouterProvider";
import { isPathMatchOfRoute, parsePathToParams } from "./helper";
import { notFoundRoute, onHoldRoute, rootRoute } from "./static";

const popstateLog = debug("popstate");

export const RouterSwitch: FC = () => {
	const { currentRoute, navigateSilent, routes, basePath } =
		useContext(RouterSwitchContext);

	// biome-ignore lint/correctness/useExhaustiveDependencies: we only need to find the initial path once
	useEffect(() => {
		const currentWindowPath = window.location.pathname;

		for (const route of routes.keys()) {
			if (isPathMatchOfRoute(currentWindowPath, route, basePath)) {
				navigateSilent(route);
				return;
			}
		}

		if (routes.has(notFoundRoute)) {
			navigateSilent(notFoundRoute);
		} else {
			throw new RouterError(
				`Path "${currentWindowPath}" not found and notFoundRoute is not setup`,
			);
		}
	}, []);

	useEffect(() => {
		// popstate
		const onPopState = (event: PopStateEvent) => {
			const id = event.state?.id;
			popstateLog("Start matching ID:", id);
			for (const route of routes.keys()) {
				if (route.id === id) {
					popstateLog("Found matching ID:", id);
					navigateSilent(route);
					return;
				}
			}
			throw new RouterError("PopStateEvent: route not found");
		};
		window.addEventListener("popstate", onPopState);
		return () => window.removeEventListener("popstate", onPopState);
	}, [navigateSilent, routes]);

	if (currentRoute === onHoldRoute) {
		return null;
	}
	if (!routes.has(rootRoute)) {
		throw new RouterError("No root path found");
	}
	const componentCallback = routes.get(currentRoute);
	if (!componentCallback) {
		throw new RouterError("No path found");
	}

	const params = parsePathToParams(
		basePath,
		currentRoute,
		window.location.pathname,
		window.location.search,
	);

	return componentCallback(params.pathParams, params.searchParams);
};
