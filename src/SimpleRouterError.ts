export class SimpleRouterError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "SimpleRouterError";
	}
}
