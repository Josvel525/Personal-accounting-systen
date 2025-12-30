// auth.js - Authentication Logic
import { clampStr } from "./utils.js";
import {
  signIn,
  signUp,
  resetPassword,
  signOutUser,
  onUserChanged,
} from "./db.js";

export function wireAuthUI({ onSignedIn, onSignedOut, toast }) {
  const elEmail = document.getElementById("authEmail");
  const elPass = document.getElementById("authPassword");

  const btnIn = document.getElementById("btnSignIn");
  const btnUp = document.getElementById("btnSignUp");
  const btnForgot = document.getElementById("btnForgot");
  const btnSignOut = document.getElementById("btnSignOut");

  btnSignOut.addEventListener("click", async () => {
    try {
      await signOutUser();
    } catch (e) {
      toast(`Sign out failed: ${e?.message || e}`, "bad");
    }
  });

  btnIn.addEventListener("click", async () => {
    const email = clampStr(elEmail.value || "", 120);
    const pass = clampStr(elPass.value || "", 200);
    if (!email || !pass) return toast("Email and password required", "bad");
    
    try {
      const user = await signIn(email, pass);
      toast(`Signed in: ${user.email}`);
    } catch (e) {
      toast(`Sign in failed: ${e?.message}`, "bad");
    }
  });

  btnUp.addEventListener("click", async () => {
    const email = clampStr(elEmail.value || "", 120);
    const pass = clampStr(elPass.value || "", 200);
    if (pass.length < 6) return toast("Password must be 6+ chars", "bad");
    
    try {
      const user = await signUp(email, pass);
      toast(`Account created: ${user.email}`);
    } catch (e) {
      toast(`Sign up failed: ${e?.message}`, "bad");
    }
  });

  btnForgot.addEventListener("click", async () => {
    const email = clampStr(elEmail.value || "", 120);
    if (!email) return toast("Enter your email first.", "warn");
    try {
      await resetPassword(email);
      toast("Password reset email sent.");
    } catch (e) {
      toast(`Reset failed: ${e?.message}`, "bad");
    }
  });

  onUserChanged((user) => {
    if (user) onSignedIn(user);
    else onSignedOut();
  });
}
