import { LinkTo } from "../../src/lib";
import { routes } from "./routes";

const AwesomeComponent: React.FC<{ koo: string; omg: string }> = ({
	omg,
	koo,
}) => {
	return (
		<p>
			my other {omg}, {koo}
			<LinkTo
				to={routes.myAwesomePath({
					omg: Math.floor(Math.random() * 50),
					koo: "asod",
					roo: "roo",
					bar: "asdf",
				})}
			>
				link
			</LinkTo>
		</p>
	);
};

export default AwesomeComponent;
