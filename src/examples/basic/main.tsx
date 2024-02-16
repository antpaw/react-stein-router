import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import {
	SimpleRouter,
	SimpleRouterError,
	SimpleRouterProvider,
} from "../../lib.ts";
import "./index.css";
import { router } from "./routes.tsx";

const root = document.getElementById("root");
if (root === null) {
	throw new SimpleRouterError("Root element not found");
}

ReactDOM.createRoot(root).render(
	<StrictMode>
		<SimpleRouterProvider basePath="/asdf/noc/vox/oooo">
			<SimpleRouter router={router} />
		</SimpleRouterProvider>
	</StrictMode>,
);
