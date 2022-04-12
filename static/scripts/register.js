document.getElementById("register").addEventListener("click", sendRegistrationInfo);
document.body.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendRegistrationInfo();
  }
});

function sendRegistrationInfo() {
  fetch("/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: document.getElementById("user").value,
      password: document.getElementById("password").value,
      email: document.getElementById("email").value
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 200) {
        window.location.href = "/login";
      } else {
        document.getElementById("incorrect-info").innerText = data.error;
        document.getElementById("incorrect-info").removeAttribute("hidden");
      }
    });
}