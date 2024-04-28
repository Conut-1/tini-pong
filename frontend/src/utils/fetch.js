import { BACKEND_URL } from "../index.js";

let reIssueTokenPromise = null;

async function request(url, options) {
  const request = new Request(url, options);
  const response = await fetch(request);
  if (response.status !== 401) {
    return response;
  }
  return handleExpiredAccesstoken(request);
}

async function handleExpiredAccesstoken(request) {
  if (!reIssueTokenPromise) {
    reIssueTokenPromise = getReIssuedAccessToken();
  }
  await reIssueTokenPromise;
  reIssueTokenPromise = null;
  return fetch(request);
}

async function getReIssuedAccessToken() {
  const response = await fetch(`${BACKEND_URL}/auth/refresh/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refresh_token: localStorage.getItem("refresh_token"),
    }),
  });
  if (response.status === 401) {
    throw new Error(response.statusText);
  }
  return response;
}

export async function fetch_get(url, options) {
  return request(url, { method: "GET", credentials: "include", ...options });
}

export async function fetch_post(url, options) {
  return request(url, { method: "POST", credentials: "include", ...options });
}

export async function fetch_delete(url, options) {
  return request(url, { method: "DELETE", credentials: "include", ...options });
}

export async function fetch_patch(url, options) {
  return request(url, { method: "PATCH", credentials: "include", ...options });
}
