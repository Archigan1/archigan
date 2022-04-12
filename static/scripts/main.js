// --------------------------------------------------
// Get Login Status
// --------------------------------------------------

fetch("/api/login/status", {
  credentials: "include"
}).then((res) => res.json()).then((json) => {
  if (json) {
    document.getElementById("profileLink").removeAttribute("hidden");
    document.getElementById("loginLink").setAttribute("hidden", "true");
  } else {
    document.getElementById("profileLink").setAttribute("hidden", "true");
    document.getElementById("loginLink").removeAttribute("hidden");
  }
});

// --------------------------------------------------
//! -------------------------------------------------
// --------------------------------------------------