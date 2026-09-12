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

export const getStats = () => client.get("/auth/stats").then((r) => r.data);

// Children
export const listChildren = () => client.get("/children").then((r) => r.data);
export const getChild = (id) => client.get(`/children/${id}`).then((r) => r.data);
export const createChild = (name, birthYear) =>
  client.post("/children", { name, birth_year: birthYear }).then((r) => r.data);
export const updateChild = (id, patch) =>
  client.patch(`/children/${id}`, patch).then((r) => r.data);
export const deleteChild = (id) => client.delete(`/children/${id}`);

// Logs
export const listLogs = (childId) =>
  client.get(`/logs/child/${childId}`).then((r) => r.data);
export const createLog = (payload) =>
  client.post("/logs", payload).then((r) => r.data);
export const updateLog = (id, payload) =>
  client.patch(`/logs/${id}`, payload).then((r) => r.data);
export const deleteLog = (id) => client.delete(`/logs/${id}`);

// On-demand AI summary — same range/type filters as the export page.
export const getLogSummary = (childId, { from, to, types } = {}) =>
  client
    .get(`/logs/summary/${childId}`, { params: { from, to, types } })
    .then((r) => r.data);

// Documents
export const listDocuments = (childId) =>
  client.get(`/documents/child/${childId}`).then((r) => r.data);

export const uploadDocument = (childId, category, file, displayName) => {
  const fd = new FormData();
  fd.append("child_id", childId);
  fd.append("category", category);
  if (displayName) fd.append("display_name", displayName);
  fd.append("file", file);
  return client.post("/documents", fd).then((r) => r.data);
};

export const updateDocument = (id, patch) =>
  client.patch(`/documents/${id}`, patch).then((r) => r.data);

export const deleteDocument = (id) => client.delete(`/documents/${id}`);

// On-demand AI extraction — never run automatically on upload.
export const extractDocument = (id) =>
  client.post(`/documents/${id}/extract`).then((r) => r.data);

// Fetches the blob (auth header attached) and prompts the browser to save it.
export async function downloadDocument(id, filename) {
  const res = await client.get(`/documents/${id}/download`, { responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "document";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
