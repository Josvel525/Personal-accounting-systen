document.addEventListener("DOMContentLoaded", async () => {
  // 1. Import Auth first so buttons work immediately
  const { wireAuthUI } = await import("./auth.js");
  const { initFirebase, loadAll } = await import("./db.js");

  initFirebase();

  const authGate = document.getElementById("authGate");
  const appViews = document.getElementById("appViews");
  const btnSignOut = document.getElementById("btnSignOut");
  const syncDot = document.getElementById("syncDot");
  const syncText = document.getElementById("syncText");
  const toastEl = document.getElementById("toast");
  const toastText = document.getElementById("toastText");

  const state = {
    user: null,
    route: "dashboard",
    data: { accounts: [], journalHeaders: [], journalLines: [] },
    reload: async () => {
      if (state.user) {
        const res = await loadAll(state.user.uid);
        state.data = res.data;
      }
    },
  };

  function toast(msg, kind = "good") {
    toastText.textContent = msg;
    toastEl.style.display = "block";
    toastEl.style.background = kind === "bad" ? "#ff5a5f" : "#1e293b";
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => (toastEl.style.display = "none"), 3000);
  }

  // 2. Wire the Auth UI (Sign In / Sign Up buttons)
  wireAuthUI({
    toast,
    onSignedIn: async (user) => {
      state.user = user;
      authGate.style.display = "none";
      appViews.style.display = "block";
      btnSignOut.style.display = "inline-flex";
      syncDot.style.background = "#2ecc71";
      syncText.textContent = "Online";
      
      await state.reload();
      // Load UI only AFTER we are logged in
      const { createUI } = await import("./ui.js");
      createUI(state, { toast });
    },
    onSignedOut: () => {
      state.user = null;
      authGate.style.display = "block";
      appViews.style.display = "none";
      btnSignOut.style.display = "none";
      syncDot.style.background = "#f1c40f";
      syncText.textContent = "Not signed in";
    }
  });
});
