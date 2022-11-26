import express from "express";
import morgan from "morgan";
import cors from "cors";

import initRoutes from "./routes.js";

const rest_port = 3000;

const app = express();

app.use(express.urlencoded({ extended: false }));
// Middleware
app.use(morgan("combined"));
app.use(cors());
app.use(express.json());

initRoutes(app);

// Handle 404
app.all("*", (req, res, next) => {
	res.status(404).send({ error: "404 Not Found" });
});

app.listen(rest_port, () => {
	console.log("Server running on port 3000");
});
