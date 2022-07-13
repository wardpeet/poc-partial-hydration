import { StaticRouter } from "react-router-dom/server";
import { App } from "./App";

export function ServerApp(props) {
  return (
    <StaticRouter {...props}>
      <App />
    </StaticRouter>
  );
}
