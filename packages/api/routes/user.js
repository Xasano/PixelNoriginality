import { User } from "../models/User.js";
import express from "express";

const userRouter = express.Router();

userRouter.get("/", async (req, res, next) => {
    try {
        const users = await User.find();
        res.json(users).sendStatus(200);
    } catch (err) {
        next(err);
    }
});

userRouter.get("/:id", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (user === null) {
            res.sendStatus(404);
            return;
        }
        res.json(user).sendStatus(200);
    }
    catch (err) {
        next(err);
    }
});

userRouter.post("/", async (req, res, next) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.json(user).sendStatus(201);
    } catch (err) {
        next(err);
    }
});

userRouter.put("/:id", async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req
            .params.id, req.body, { new: true });
        if (user === null) {
            res.sendStatus(404);
            return;
        }
        res.json(user).sendStatus(200);
    } catch (err) {
        next(err);
    }
});

userRouter.delete("/:id", async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (user === null) {
            res.sendStatus(404);
            return;
        }
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
});

export { userRouter };