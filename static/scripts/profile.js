(async () => {
  const accountInfo = await (async () => {
    let data = {};

    const res = await fetch(`/api/profile/${window.location.pathname.slice(9)}`);
    data = await res.json();

    if (data.status === 200) return data;
    else document.body.innerText = JSON.stringify(data, null, 2);
  })();

  const socialMediaMap = new Map([
    [ "github", { name: "GitHub", icon: "fa-github" } ],
    [ "twitter", { name: "Twitter", icon: "fa-twitter" } ],
    [ "instagram", { name: "Instagram", icon: "fa-instagram" } ],
    [ "youtube", { name: "YouTube", icon: "fa-youtube" } ],
    [ "pinterest", { name: "Pinterest", icon: "fa-pinterest" } ],
    [ "reddit", { name: "Reddit", icon: "fa-reddit" } ],
    [ "quora", { name: "Quora", icon: "fa-quora" } ],
    [ "stackoverflow", { name: "Stack Overflow", icon: "fa-stack-overflow" } ]
  ])

  // --------------------------------------------------
  // Create Profile Card Data
  // --------------------------------------------------

  document.getElementById("username").innerText = accountInfo.user.username;
  if (!accountInfo.user.bio) document.getElementById("bio").setAttribute("hidden", true);
  else document.getElementById("bio").innerText = accountInfo.user.bio;
  if (!accountInfo.user.socials) return;
  Object.entries(accountInfo.user.socials).forEach(([key, link]) => {
    const mapValue = socialMediaMap.get(key);
    const name = mapValue.name;
    const iconClass = mapValue.icon;

    document.getElementById("socials").innerHTML +=
      `<li class="list-group-item bg-dark">
        <a href="${link}" class="text-white">
          <i class="fab ${iconClass}"></i> ${name}
        </a>
      </li>`
  });
})()