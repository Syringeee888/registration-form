"use strict";

/* ---------- Pure validation functions (no DOM access) ---------- */

function isValidStudentNumber(value) {
  if (typeof value !== "string") return false;
  return /^\d{2}-\d{4}-\d{3}$/.test(value.trim());
}

function isValidPassword(value) {
  if (typeof value !== "string") return false;
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!])\S{8,}$/.test(value);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function isValidMobile(value) {
  return /^(09\d{9}|\+639\d{9})$/.test(String(value).trim());
}

function passwordProblems(value) {
  const problems = [];
  if (value.length < 8) problems.push("at least 8 characters");
  if (!/[A-Z]/.test(value)) problems.push("one uppercase letter");
  if (!/\d/.test(value)) problems.push("one digit");
  if (!/[@$!]/.test(value)) problems.push("one of @, $, or !");
  if (/\s/.test(value)) problems.push("no spaces");
  return problems;
}

/* ---------- Browser behavior ---------- */

if (typeof document !== "undefined") {
  const $ = (id) => document.getElementById(id);
  const form = $("registrationForm");

  const setError = (fieldId, errorId, message) => {
    const field = $(fieldId);
    const err = $(errorId);
    err.textContent = message;
    field.setAttribute("aria-invalid", message ? "true" : "false");
    const ids = (field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
    if (!ids.includes(errorId)) ids.push(errorId);
    field.setAttribute("aria-describedby", ids.join(" "));
    return !message;
  };

  const checks = {
    fullName() {
      const v = $("fullName").value.trim();
      const msg = v.length === 0 ? "Enter your full name."
        : v.length < 2 ? "Full name must be at least two characters." : "";
      return setError("fullName", "fullNameError", msg);
    },
    studentNumber() {
      const v = $("studentNumber").value.trim();
      const msg = v === "" ? "Student number is required. Use the format 24-1234-123."
        : !isValidStudentNumber(v) ? "Enter a student number in the format 24-1234-123." : "";
      return setError("studentNumber", "studentNumberError", msg);
    },
    email() {
      const v = $("email").value.trim();
      const msg = v === "" ? "Email address is required."
        : !isValidEmail(v) ? "Enter a valid email such as name@example.com." : "";
      return setError("email", "emailError", msg);
    },
    mobileNumber() {
      const v = $("mobileNumber").value.trim();
      const msg = v === "" ? "Mobile number is required."
        : !isValidMobile(v) ? "Enter a mobile number as 09XXXXXXXXX or +639XXXXXXXXX, with no spaces or hyphens." : "";
      return setError("mobileNumber", "mobileNumberError", msg);
    },
    password() {
      const v = $("password").value;
      let msg = "";
      if (v === "") msg = "Password is required.";
      else if (!isValidPassword(v)) msg = "Password needs " + passwordProblems(v).join(", ") + ".";
      return setError("password", "passwordError", msg);
    },
    confirmPassword() {
      const v = $("confirmPassword").value;
      const msg = v === "" ? "Confirm your password."
        : v !== $("password").value ? "Passwords do not match." : "";
      return setError("confirmPassword", "confirmPasswordError", msg);
    },
    course() {
      const v = $("course").value;
      const msg = v !== "BSIT" && v !== "BSCS" ? "Select BSIT or BSCS." : "";
      return setError("course", "courseError", msg);
    },
    terms() {
      const msg = $("terms").checked ? "" : "You must agree to the terms to register.";
      return setError("terms", "termsError", msg);
    }
  };

  const updatePasswordFeedback = () => {
    const v = $("password").value;
    const fb = $("passwordFeedback");
    fb.classList.remove("good", "bad");
    if (v === "") { fb.textContent = ""; return; }
    const problems = passwordProblems(v);
    if (problems.length === 0) {
      fb.textContent = "Password meets all requirements.";
      fb.classList.add("good");
    } else {
      fb.textContent = "Still needed: " + problems.join(", ") + ".";
      fb.classList.add("bad");
    }
  };

  const clearOutput = () => {
    $("successMessage").textContent = "";
    $("successMessage").hidden = true;
    ["summaryName", "summaryStudentNumber", "summaryEmail", "summaryMobileNumber", "summaryCourse"]
      .forEach((id) => { $(id).textContent = ""; });
    $("registrationSummary").hidden = true;
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearOutput();
    // Run every check so all errors show at once.
    const results = Object.values(checks).map((fn) => fn());
    if (!results.every(Boolean)) {
      const firstBad = form.querySelector('[aria-invalid="true"]');
      if (firstBad) firstBad.focus();
      return;
    }
    $("summaryName").textContent = $("fullName").value.trim();
    $("summaryStudentNumber").textContent = $("studentNumber").value.trim();
    $("summaryEmail").textContent = $("email").value.trim();
    $("summaryMobileNumber").textContent = $("mobileNumber").value.trim();
    $("summaryCourse").textContent = $("course").value;
    $("successMessage").textContent = "Registration details validated successfully!";
    $("successMessage").hidden = false;
    $("registrationSummary").hidden = false;
  });

  $("password").addEventListener("input", () => {
    updatePasswordFeedback();
    if ($("confirmPassword").value !== "") checks.confirmPassword();
  });
  $("fullName").addEventListener("blur", checks.fullName);
  $("course").addEventListener("change", checks.course);
  $("terms").addEventListener("change", checks.terms);

  // Re-check a field as it is corrected, but only after it has an error.
  [["studentNumber", "studentNumberError"], ["email", "emailError"],
   ["mobileNumber", "mobileNumberError"], ["fullName", "fullNameError"],
   ["confirmPassword", "confirmPasswordError"], ["password", "passwordError"]]
    .forEach(([id, errId]) => {
      $(id).addEventListener("input", () => {
        if ($(errId).textContent) checks[id]();
      });
    });

  form.addEventListener("reset", () => {
    ["fullName", "studentNumber", "email", "mobileNumber", "password", "confirmPassword", "course", "terms"]
      .forEach((id) => {
        $(id).removeAttribute("aria-invalid");
      });
    ["fullNameError", "studentNumberError", "emailError", "mobileNumberError",
     "passwordError", "confirmPasswordError", "courseError", "termsError"]
      .forEach((id) => { $(id).textContent = ""; });
    const fb = $("passwordFeedback");
    fb.textContent = "";
    fb.classList.remove("good", "bad");
    clearOutput();
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { isValidStudentNumber, isValidPassword };
}