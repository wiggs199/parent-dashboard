import client from "./client";

// Children
export const listChildren = () => client.get("/children").then((r) => r.data);
export const createChild = (name) =>
  client.post("/children", { name }).then((r) => r.data);

// Logs
export const listLogs = (childId) =>
  client.get(`/logs/child/${childId}`).then((r) => r.data);
export const createLog = (payload) =>
  client.post("/logs", payload).then((r) => r.data);

// Documents
export const listDocuments = (childId) =>
  client.get(`/documents/child/${childId}`).then((r) => r.data);

// Exploration tips
export const listTips = (childId) =>
  client.get(`/explorationtips/child/${childId}`).then((r) => r.data);
