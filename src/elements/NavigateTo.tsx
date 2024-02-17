import { useContext, useEffect } from "react";
import { RouterSwitchContext } from "../RouterProvider";
import { generatePathFromRoute } from "../helper";
import { RoutePathBuilder } from "../types";

type NavigateToProps = {
	to: RoutePathBuilder;
};

export const NavigateTo = ({ to: routePathBuilder }: NavigateToProps) => {
	const { route, pathParams, searchParams } = routePathBuilder;
	const { navigateReplace, basePath } = useContext(RouterSwitchContext);
	const path = generatePathFromRoute(basePath, route, pathParams, searchParams);

	useEffect(() => {
		navigateReplace(route, path);
	}, [route, path, navigateReplace]);

	return null;
};
