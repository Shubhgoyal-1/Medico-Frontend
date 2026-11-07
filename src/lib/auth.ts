export const AUTH_CHANGED_EVENT = "medico-auth-changed";

export function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  sessionStorage.removeItem("doctor_profile");
  notifyAuthChanged();
}

export function apiErrorMessage(error: any, fallback: string) {
  return error?.response?.data?.message || fallback;
}
