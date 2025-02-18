import express, { json } from "express";
import cors from "cors";

import { api } from "./api.js";

const app = express();
const port = 8000;

app.use(cors()); //autorise le CORS
app.use(json());

app.use("/api", api);

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
