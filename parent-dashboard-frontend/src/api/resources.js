import client from "./client";

// Auth — account recovery / verification
export const verifyEmail = (token) =>
  client.post("/auth/verify-email", { token }).then((r) => r.data);
export const resendVerification = () =>
  client.post("/auth/resend-verification").then((r) => r.data);
export const forgotPassword = (email) =>
  client.post("/auth/forgot-password", { email }).then((r) => r.data);
export const resetPassword = (token, newPassword) =>
  client.post("/auth/reset-password", { token, new_password: newPassword }).then((r) => r.data);

// Children
export const listChildren = () => client.get("/children").then((r) => r.data);
export const createChild = (name) =>
  client.post("/children", { name }).then((r) => r.data);
export const updateChild = (id, name) =>
  client.patch(`/children/${id}`, { name }).then((r) => r.data);
export const deleteChild = (id) => client.delete(`/children/${id}`);

// Logs
export const listLogs = (childId) =>
  client.get(`/logs/child/${childId}`).then((r) => r.data);
export const createLog = (payload) =>
  client.post("/logs", payload).then((r) => r.data);
export const updateLog = (id, payload) =>
  client.patch(`/logs/${id}`, payload).then((r) => r.data);
export const deleteLog = (id) => client.delete(`/logs/${id}`);

// Documents
export const listDocuments = (childId) =>
  client.get(`/documents/child/${childId}`).then((r) => r.data);

// Exploration tips
export const listTips = (childId) =>
  client.get(`/explorationtips/child/${childId}`).then((r) => r.data);
