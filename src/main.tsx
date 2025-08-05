import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App";
import "./index.css";
import store from "./redux/store";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <BrowserRouter basename="/admin">
      <App />
    </BrowserRouter>
  </Provider>
);
