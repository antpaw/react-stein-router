import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { SimpleRouter, SimpleRouterProvider } from "../../src/lib.ts";
import "./index.css";
import { router } from "./routes.tsx";

const root = document.getElementById("root");
if (root === null) {
	throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
	<StrictMode>
		<SimpleRouterProvider router={router} basePath="/asdf/noc/vox/oooo">
			<SimpleRouter />
		</SimpleRouterProvider>
	</StrictMode>,
);
