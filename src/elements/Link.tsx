import { AnchorHTMLAttributes, ReactNode, useContext } from "react";
import { RouterSwitchContext } from "../RouterProvider";
import { generatePathFromRoute } from "../helper";
import { RoutePathBuilder } from "../types";

type LinkToProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
	to: RoutePathBuilder;
	children?: ReactNode;
};

export const LinkTo = ({
	to: routePathBuilder,
	onClick,
	children,
	...rest
}: LinkToProps) => {
	const { route, pathParams, searchParams } = routePathBuilder;
	const { navigate, basePath } = useContext(RouterSwitchContext);
	const path = generatePathFromRoute(basePath, route, pathParams, searchParams);
	return (
		// biome-ignore lint/a11y/useValidAnchor: this can not be a <button>
		<a
			{...rest}
			href={path}
			onClick={(event) => {
				onClick?.(event);
				event.preventDefault();
				navigate(route, path);
			}}
		>
			{children}
		</a>
	);
};

export const LinkHref = ({
	href,
	onClick,
	children,
	...rest
}: AnchorHTMLAttributes<HTMLAnchorElement>) => {
	const path = href || "";
	const { navigate, findRoute } = useContext(RouterSwitchContext);
	return (
		// biome-ignore lint/a11y/useValidAnchor: this can not be a <button>
		<a
			{...rest}
			href={path}
			onClick={(event) => {
				onClick?.(event);
				const route = findRoute(path);
				if (route) {
					event.preventDefault();
					navigate(route, path);
				}
			}}
		>
			{children}
		</a>
	);
};
