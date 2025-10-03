// @ts-nocheck

// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // Importação global de CSS
import "./styles/spintax.css"; // Estilos para SpinTax

// Renderiza o aplicativo React na div com id 'root'
ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
