import { useContext } from "react";
import { SimpleRouterContext } from "../SimpleRouterProvider";
import { generatePathFromRoute } from "../helper";
import { RoutePathBuilder } from "../types";

type LinkToProps = Omit<
	React.AnchorHTMLAttributes<HTMLAnchorElement>,
	"href"
> & {
	to: RoutePathBuilder;
	children?: React.ReactNode;
};

export const LinkTo = ({
	to: routePathBuilder,
	onClick,
	children,
	...rest
}: LinkToProps) => {
	const { route, pathParams, searchParams } = routePathBuilder;
	const { navigate, basePath } = useContext(SimpleRouterContext);
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

export const LinkToX = ({ className, children, ...rest }: LinkToProps) => {
	// activeOptions={{ exact }}
	// activeProps={{ className: `font-bold ` }}

	const { isActive } = useContext(SimpleRouterContext);
	const isA = isActive(rest.to.route);
	return (
		<LinkTo className={`${className} ${isA ? "yay" : "nay"}`} {...rest}>
			{children}
		</LinkTo>
	);
};
