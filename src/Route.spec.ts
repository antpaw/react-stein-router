import { expect, it } from "vitest";
import { createRoute } from "./Route";

it("create route", () => {
	expect(createRoute("/route").pathParamsVars.length).toBe(0);
});

it("create route with params", () => {
	expect(createRoute("/route/{my}/test").pathParamsVars.length).toBe(1);
	expect(createRoute("/route/{my}/test").pathParamsVars[0]).toBe("my");
});

it("create faulty route", () => {
	expect(() => createRoute("route/ao")).toThrow();
});
