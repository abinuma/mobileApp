import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);

//what  is the purpose of wraping the App component with BrowserRouter in the main.jsx file?
//The purpose of wrapping the App component with BrowserRouter in the main.jsx file is to enable client-side routing in the React application. BrowserRouter is a component from the react-router-dom library that provides the necessary context for routing to work. By wrapping the App component with BrowserRouter, you can use routing features such as defining routes, navigating between different pages, and managing the browser history within your React application. This allows for a seamless user experience without needing to reload the entire page when navigating between different views or components.