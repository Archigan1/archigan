document.getElementById("sign-in").addEventListener("click", sendLoginInfo);
document.body.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendLoginInfo();
  }
});


function sendLoginInfo() {
  fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      login: document.getElementById("user").value,
      password: document.getElementById("password").value
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 200) {
        window.location.href = "/profile";
      } else {
        document.getElementById("incorrect-info").innerText = data.error;
        document.getElementById("incorrect-info").removeAttribute("hidden");
      }
    });
}