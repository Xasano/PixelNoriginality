import { Router } from "express";

const api = Router();

api.get("/", (req, res) => {
  // GET SUR localhost:8000/
  res.json("Hello World!");
});

export { api };
