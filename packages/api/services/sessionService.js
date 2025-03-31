import { Visitor } from "../models/Visitor.js";

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours en ms

export const createVisitorSession = async (res, pixelBoardId) => {
  // Génère un nouvel identifiant de visiteur
  const visitor = new Visitor();
  visitor.lastPixelBoardId = pixelBoardId;
  await visitor.save();
  // Définir le cookie pour le visiteur
  setVisitorCookie(res, visitor.visitorId);
  return visitor.visitorId;
};

export const validateVisitorSession = async (visitorId) => {
  if (!visitorId) return null;

  const visitor = await Visitor.findOne({ visitorId });
  return visitor;
};

export const refreshVisitorSession = async (visitorId, res) => {
  if (!visitorId) return false;

  const visitor = await Visitor.findOne({ visitorId });
  if (!visitor) return false;
  // Mettre à jour la date de dernière connexion
  visitor.lastConnection = new Date();
  await visitor.save();
  // Prolonge le cookie
  setVisitorCookie(res, visitorId);
  return true;
};

export const setVisitorCookie = (res, visitorId) => {
  res.cookie("visitorId", visitorId, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    sameSite: "strict",
    path: "/",
  });
};

export const clearVisitorSession = (res) => {
  res.clearCookie("visitorId", { path: "/" });
};

export const getVisitorSessionInfo = async (visitorId) => {
  if (!visitorId) return null;

  const visitor = await Visitor.findOne({ visitorId });
  if (!visitor) return null;

  return {
    id: visitor.visitorId,
    createdAt: visitor.createdAt,
    lastConnection: visitor.lastConnection,
    lastPixelPlaced: visitor.lastPixelPlaced,
    isVisitor: true,
  };
};
