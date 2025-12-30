/**
 * app.js
 */
document.addEventListener("DOMContentLoaded", async () => {
  const { wireAuthUI } = await import("./auth.js");
  const { initFirebase, loadAll } = await import("./db.js");
  const { createUI } = await import("./ui.js");

  initFirebase();

  const authGate = document.getElementById("authGate");
  const appViews = document.getElementById("appViews");
  const btnSignOut = document.getElementById("btnSignOut");
  const toastEl = document.getElementById("toast");
  const toastText = document.getElementById("toastText");

  const state = {
    user: null,
    route: "dashboard",
    data: { accounts: [], journalHeaders: [], journalLines: [] },
    reload: async () => {
      if (state.user) {
        const result = await loadAll(state.user.uid);
        state.data = result.data;
        createUI(state, { toast }); // Refresh UI with new data
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

  wireAuthUI({
    toast,
    onSignedIn: async (user) => {
      state.user = user;
      authGate.style.display = "none";
      appViews.style.display = "block";
      btnSignOut.style.display = "inline-flex";
      
      await state.reload(); // Load data
      createUI(state, { toast }); // Initial Render

      // Wire Sidebar Navigation
      document.querySelectorAll(".navItem").forEach(btn => {
        btn.onclick = () => {
          state.route = btn.dataset.route;
          document.querySelectorAll(".navItem").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          createUI(state, { toast });
        };
      });
    },
    onSignedOut: () => {
      state.user = null;
      authGate.style.display = "block";
      appViews.style.display = "none";
      btnSignOut.style.display = "none";
    },
  });
});
