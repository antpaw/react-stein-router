import { describe, expect, it } from "vitest";
import { createRoute } from "./Route";
import {
	generatePathFromRoute,
	generateRegexString,
	isMatch,
	isPathMatchOfRoute,
	parsePathToParams,
	parseVariablesFromPath,
	validatePath,
} from "./helper";

describe("parseVariablesFromPath", () => {
	it("parse empty vars", () => {
		const route = parseVariablesFromPath("/route");
		expect(route.length).toBe(0);
	});

	it("parse router vars", () => {
		const route = parseVariablesFromPath("/route/{id}/nox/{foo}");
		expect(route.length).toBe(2);
		expect(route[0]).toBe("id");
		expect(route[1]).toBe("foo");
	});
});

describe("parseVariablesFromPath", () => {
	it("generate path", () => {
		const path = generatePathFromRoute(
			"",
			createRoute("/route/{id}/nox/{foo}"),
			{
				id: 2,
				foo: 4,
			},
		);
		expect(path).toBe("/route/2/nox/4");
	});

	it("generate path with search", () => {
		const path = generatePathFromRoute(
			"",
			createRoute("/route/{id}/nox/{foo}"),
			{
				id: 2,
				foo: 4,
			},
			{ test: "moo" },
		);
		expect(path).toBe("/route/2/nox/4?test=moo");
	});

	it("generate path with basePath", () => {
		const path = generatePathFromRoute(
			"/moo",
			createRoute("/route/{id}/nox/{foo}"),
			{
				id: 2,
				foo: 4,
			},
		);
		expect(path).toBe("/moo/route/2/nox/4");
	});
});

it("parsePathToParams", () => {
	expect(
		parsePathToParams(
			"",
			createRoute("/route/{id}/nox/{foo}"),
			"/route/2/nox/4",
		).pathParams.get("id"),
	).toBe("2");
});

it("parsePathToParams with basePath", () => {
	expect(
		parsePathToParams(
			"/my/test",
			createRoute("/route/{id}/nox/{foo}"),
			"/my/test/route/2/nox/4",
		).pathParams.get("id"),
	).toBe("2");
});

it("parsePathToParams with ignored basePath", () => {
	expect(
		parsePathToParams(
			"/my/test",
			createRoute("/route/{id}/nox/{foo}"),
			"/route/2/nox/4",
		).pathParams.get("id"),
	).toBe("2");
});

it("parsePathToParams search", () => {
	expect(
		parsePathToParams(
			"",
			createRoute("/route/nox"),
			"/route/nox",
			"?test=moo",
		).searchParams.get("test"),
	).toBe("moo");
});

it("generateRegex ", () => {
	expect(
		new RegExp(generateRegexString("/route/{blue}/foo", ["blue"])),
	).toStrictEqual(/\/route\/([a-zA-Z0-9]+)\/foo/);
});

it("generateRegex with base", () => {
	expect(
		new RegExp(generateRegexString("/route/{blue}/foo", ["blue"])),
	).toStrictEqual(/\/route\/([a-zA-Z0-9]+)\/foo/);
});

it("validatePath", () => {
	expect(() => validatePath("/")).not.toThrow();
	expect(() => validatePath("/route")).not.toThrow();
	expect(() => validatePath("/route/")).toThrow();
	expect(() => validatePath("route/")).toThrow();
});

describe("isPathMatchOfRoute", () => {
	it("isMatch", () => {
		const route = createRoute("/route");
		expect(isPathMatchOfRoute("/foobar", route)).toBe(false);
		expect(isPathMatchOfRoute("/route", route)).toBe(true);
		expect(isPathMatchOfRoute("/route/", route)).toBe(true);
		expect(isPathMatchOfRoute("/b/route/a", route)).toBe(false);
		expect(isPathMatchOfRoute("/b/route", route)).toBe(false);
		expect(isPathMatchOfRoute("/route/a", route)).toBe(false);
	});

	it("isMatch with basePath and root", () => {
		const route = createRoute("/");
		expect(isPathMatchOfRoute("/my/test/f", route, "/my/test")).toBe(false);
		expect(isPathMatchOfRoute("/mym/test/f", route, "/my/test")).toBe(false);
		expect(isPathMatchOfRoute("/my/test/", route, "/my/test")).toBe(true);
		expect(isPathMatchOfRoute("/my/test", route, "/my/test")).toBe(true);
	});

	it("isMatch with params", () => {
		const route = createRoute("/route/{id}");
		expect(isPathMatchOfRoute("/foobar", route)).toBe(false);
		expect(isPathMatchOfRoute("/route", route)).toBe(false);
		expect(isPathMatchOfRoute("/route/3/kuu", route)).toBe(false);
		expect(isPathMatchOfRoute("/route/3", route)).toBe(true);
	});

	it("isMatch with params", () => {
		const route = createRoute("/route/{id}/route");
		expect(isPathMatchOfRoute("/route/3/route", route)).toBe(true);
	});

	it("isMatch with multiple params", () => {
		const route = createRoute("/route/{id}/mee/{subId}");
		expect(isPathMatchOfRoute("/foobar", route)).toBe(false);
		expect(isPathMatchOfRoute("/route", route)).toBe(false);
		expect(isPathMatchOfRoute("/route/3", route)).toBe(false);
		expect(isPathMatchOfRoute("/route/3/mee/6", route)).toBe(true);
		expect(isPathMatchOfRoute("/route/3/mee/6/", route)).toBe(true);
		expect(isPathMatchOfRoute("/route/3/mee/6/cho", route)).toBe(false);
	});

	it("wildcard", () => {
		const route = createRoute("/route/{id}/mee/{subId}/*");
		expect(isPathMatchOfRoute("/route/id/roo", route)).toBe(false);
		expect(isPathMatchOfRoute("/route/id/mee/roo", route)).toBe(true);
		expect(isPathMatchOfRoute("/route/id/mee/roo/", route)).toBe(true);
		expect(isPathMatchOfRoute("/route/id/mee/roo/roo", route)).toBe(true);
		expect(isPathMatchOfRoute("/route/id/mee/roo/roo/go/", route)).toBe(true);
	});

	it("basePath", () => {
		const basePath = "/asdf";
		const route = createRoute("/route/{id}");
		expect(isPathMatchOfRoute("/route/id", route, basePath)).toBe(false);
		expect(isPathMatchOfRoute("/oan/route/id", route, basePath)).toBe(false);
		expect(isPathMatchOfRoute("/asdf/route/id", route, basePath)).toBe(true);
		expect(isPathMatchOfRoute("/roo/asdf/route/id", route, basePath)).toBe(
			false,
		);
	});

	it("useWithout is true", () => {
		const route = createRoute("/home");
		const basePath = "";
		expect(isPathMatchOfRoute("/home/1", route, basePath, true)).toBe(true);
		expect(isPathMatchOfRoute("/about/1", route, basePath, true)).toBe(false);
		expect(isPathMatchOfRoute("/home", route, basePath, true)).toBe(true);
	});
});

describe("isMatch", () => {
	it("when path matches with isExact", () => {
		const route = createRoute("/home");
		expect(isMatch("/home", "", { route }, true)).toBe(true);
		expect(isMatch("/about", "/home", { route }, false)).toBe(false);
	});

	it("when path with vars matches with isExact", () => {
		const route = createRoute("/home/{id}");
		expect(
			isMatch("/base/home/1", "/base", { route, pathParams: { id: 2 } }, true),
		).toBe(false);
		expect(
			isMatch(
				"/base/home/1",
				"/base",
				{ route, pathParams: { id: 2 } },
				true,
				true,
			),
		).toBe(false);
		expect(
			isMatch("/home/2", "", { route, pathParams: { id: 2 } }, false),
		).toBe(true);
		expect(
			isMatch("/home/1", "", { route, pathParams: { id: 2 } }, false, true),
		).toBe(true);
		expect(
			isMatch("/home/1", "/foo", { route, pathParams: { id: 2 } }, false, true),
		).toBe(false);
	});
});
