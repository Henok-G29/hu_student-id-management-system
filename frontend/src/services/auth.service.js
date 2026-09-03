import { apiRequest } from "./api";

export async function loginAdmin(email, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export async function getCurrentAdmin() {
  return apiRequest("/auth/me");
}
