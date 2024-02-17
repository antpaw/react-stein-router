import { NavigateTo, steinRouter } from "../../src/lib.ts";
import AwesomeComponent from "./AwesomeComponent.tsx";
import MyStuff from "./MyStuff.tsx";

export const router = steinRouter();

const { root, parent, route, notFound } = router;

const myParent = parent(
	"/moo/{koo}/foo/{roo}",
	parent("/verdi/{bar}", parent("/fom")),
);

export const routes = {
	rootPath: root((_pathParams, _searchParams) => (
		<NavigateTo
			to={routes.myAwesomePath({
				omg: "omg",
				koo: 4,
				bar: "bar",
				roo: "roo",
			})}
		/>
	)),
	myAwesomePath: route(
		"/asdf/{omg}/yolo",
		(pathParams) => (
			<AwesomeComponent
				omg={pathParams.get("omg") ?? ""}
				koo={pathParams.get("koo") ?? ""}
			/>
		),
		myParent,
	),

	fooPath: route("/foo-yolo", (_pathParams) => <MyStuff />),

	notFound: notFound((_pathParams, _searchParams) => <p>404 - not found</p>),
};
