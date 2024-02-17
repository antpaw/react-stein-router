import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, RouterSwitch } from "../../src/lib.ts";
import "./index.css";
import { router } from "./routes.tsx";

const root = document.getElementById("root");
if (root === null) {
	throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
	<StrictMode>
		<RouterProvider router={router} basePath="/asdf/noc/vox/oooo">
			<RouterSwitch />
		</RouterProvider>
	</StrictMode>,
);
