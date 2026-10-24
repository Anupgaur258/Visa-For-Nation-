export function showAdminToast(message, type = 'success') {
  if (!message || typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('vfn-admin-toast', { detail: { message, type } }));
}
