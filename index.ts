import express, { json, RequestHandler, urlencoded } from "express";
import { createWriteStream } from "fs";
import { Users } from "./database";
import serveStatic from "serve-static";
import config from "./config";
import Interval from "jsinterval";
import miniget from "miniget";
import chalk from "chalk";
import renderTemplate from "./HTMLTemplatePlugin";
import session from "express-session";
import MongoStore from "connect-mongo";
import { sha256 } from "js-sha256";
import { v4 as UUIDv4 } from "uuid";

//! CODE NOT IN USE: -----          import { sendEmail } from "./email";

const app = express();
const cwd = process.cwd();
const port = config.port || 3000;

const errorStream = createWriteStream(`${cwd}/error.log`, { flags: "a" });

const encrypt = (password: string) => {
  for (let i = 0; i < config.secrets.encryptionLevel; i++) {
    password = sha256(password);
  }

  return password;
};

// app.set("trust proxy", true);
app.use(json());
// app.use(urlencoded({ extended: true }));
app.use(session({
  secret: config.secrets.SESSIONSECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
  store: MongoStore.create({ mongoUrl: config.secrets.MONGOURL })
}));


app.all('*', (req, res, next) => {
  if (!req.session.user) {
    req.session.user = {
      username: "Guest"
    };
  }

  next();

  // const currentPath = "https://archigan.repl.co" + req.path;

  // if (req.hostname.toLowerCase() !== "archigan.repl.co") {
  //   res.status(301).redirect(currentPath);
  // } else if (req.get('X-Forwarded-Proto') == "http") {
  //   res.status(101).redirect(currentPath);
  // } else {
  //   next();
  // }
});

app.get("/", (req, res) => {
  res.sendFile(`${cwd}/index.html`);
});

app.get("/privacy-policy", (req, res) => {
  res.sendFile(`${cwd}/privacy-policy.html`);
});

// TODO: Search Page
// TODO: --- Include search results from profiles

app.use("/static", serveStatic(`${cwd}/static`) as RequestHandler);
app.use("/games", serveStatic(`${cwd}/games`, { extensions: ["html"] }) as RequestHandler);
app.use("/error", serveStatic(`${cwd}/error`, { extensions: ["html"] }) as RequestHandler);

// --------------------------------------------------
// Profile / Account / Login 
// --------------------------------------------------

// -------------------------
// Profile API
// -------------------------

app.get("/api/profile/:username", async (req, res) => {
  const user = await Users.findOne({ username: req.params.username });
  if (!user) res.status(404).json({
    error: "User not found",
    status: 404
  });

  res.json({
    user: {
      username: user!.username,
      bio: user!.bio,
      socials: user!.socials,
      profilePicture: user!.profilePicture,
    },
    status: 200
  });
});

app.get("/api/login/status", (req, res) => {
  if (req.session.user!.username === "Guest") res.json(false);
  else res.json(true);
});

app.post("/api/login", async (req, res) => {
  const { login, password } = req.body;
  const user = await (async (login) => {
    if (/\S+@\S+\.\S+/.test(login)) {
      return await Users.findOne({ email: login.toLowerCase() });
    } else {
      return await Users.findOne({ username: login });
    }
  })(login.trim());

  if (!user) {
    res.status(404).json({
      error: "User not found",
      status: 404
    });
  }

  if (encrypt(password) !== user!.password) {
    res.status(401).json({
      error: "Incorrect password",
      status: 401
    });
  }

  req.session.user = {
    username: user!.username,
  };

  res.json({
    message: "Logged in",
    status: 200
  });
});

app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;
         
  if (username === "Guest" || await Users.findOne({ username }) || await Users.findOne({ email })) {
    res.status(409).json({
      error: "Username or email already in use",
      status: 409
    });
  }

  const newUUID = (async () => {
    const uuid = UUIDv4();
    if (await Users.findOne({ userID: uuid })) {
      return newUUID();
    } else {
      return uuid;
    }
  });

  const userid = await newUUID();

  const user = new Users({
    username: username.trim(),
    email: email.toLowerCase().trim(),
    password: encrypt(password.trim()),
    userID: userid,
    createdAt: new Date(),
    admin: false,
    verified: false,
    bio: "",
    profilePicture: ""
  });

  await user.save();

  res.json({
    message: "User created",
    status: 200
  });
});

app.post("/api/settings", async (req, res) => {
  const settings = req.body;
  const user = await Users.findOne({ username: req.session.user!.username });

  if (!user) {
    res.status(401).json({
      error: "User not logged in.",
      status: 401
    });
  }

  if (settings.bio) user!.bio = settings.bio;
  if (settings.github) user!.socials.github = settings.github;
  if (settings.twitter) user!.socials.twitter = settings.twitter;
  if (settings.instagram) user!.socials.instagram = settings.instagram;
  if (settings.youtube) user!.socials.youtube = settings.youtube;
  if (settings.pinterest) user!.socials.pinterest = settings.pinterest;
  if (settings.reddit) user!.socials.reddit = settings.reddit;
  if (settings.quora) user!.socials.quora = settings.quora;
  if (settings.stackoverflow) user!.socials.stackoverflow = settings.stackoverflow;

  await user!.save();

  res.json({
    message: "Settings updated",
    status: 200
  });
});

// -------------------------
// End: Profile API
// -------------------------

app.get("/login", (req, res) => {
  if (req.session.user!.username !== "Guest") {
    return res.redirect(`/profile/${req.session.user!.username}`);
  }

  res.sendFile(`${cwd}/profiles/login.html`);
});

app.get("/register", (req, res) => {
  if (req.session.user!.username !== "Guest") {
    return res.redirect(`/profile/${req.session.user!.username}`);
  }

  res.sendFile(`${cwd}/profiles/register.html`);
});

app.get("/profile", (req, res) => {
  if (req.session.user!.username !== "Guest") {
    return res.redirect(`/profile/${req.session.user!.username}`);
  }
});

app.get("/profile/:username", async (req, res) => {
  const user = await Users.findOne({ username: req.params.username });
  if (!user) return res.status(404).sendFile(`${cwd}/error/404.html`);
  let selfProfile = false;

  if (req.session.user) {
    if (req.session.user.username === req.params.username) {
      selfProfile = true;
    }
  }

  res.send(renderTemplate({
    path: `${cwd}/profiles/profile.html`,
    data: { selfProfile: `${selfProfile}` }
  }));
});

// --------------------------------------------------
// Suggestions
// --------------------------------------------------

app.get("/suggestion-form", (req, res) => res.status(503).sendFile(`${cwd}/error/503.html`));

//! CODE NOT IN USE: -----          const suggestionStream = createWriteStream(`${cwd}/TODO.md`, { flags: 'a' });
//! CODE NOT IN USE: -----          
//! CODE NOT IN USE: -----          app.get("/suggestion-form", (req, res) => res.sendFile(`${cwd}/suggestions/index.html`));
//! CODE NOT IN USE: -----          app.get("/api/gmail-request", (req, res) => res.json(req.query));
//! CODE NOT IN USE: -----          
//! CODE NOT IN USE: -----          app.post("/suggestion-form", (req, res) => {
//! CODE NOT IN USE: -----            const suggestion = req.body.suggestion;
//! CODE NOT IN USE: -----            const emailContent = readFileSync(`${cwd}/suggestions/suggestion-email.html`, "utf8").replace("<SUGGESTION />", suggestion);
//! CODE NOT IN USE: -----            
//! CODE NOT IN USE: -----            suggestionStream.write(`* ${suggestion}\n`);
//! CODE NOT IN USE: -----          
//! CODE NOT IN USE: -----            sendEmail({
//! CODE NOT IN USE: -----              from: "Website Server",
//! CODE NOT IN USE: -----              to: config.secrets.serverEmailTo!,
//! CODE NOT IN USE: -----              subject: "New Suggestion",
//! CODE NOT IN USE: -----              html: emailContent
//! CODE NOT IN USE: -----            });
//! CODE NOT IN USE: -----          
//! CODE NOT IN USE: -----            res.sendFile(`${cwd}/suggestions/received.html`);
//! CODE NOT IN USE: -----          });

// --------------------------------------------------
// Server Maintenence Code
// --------------------------------------------------

let allow = true;
app.get("/status", (req, res) => {
  res.json(allow);
  if (allow) {
    allow = false;
    setTimeout(() => allow = true, 5000);
  }
});

new Interval({
  func: () => {
    config.websites.forEach(async website =>
      await miniget(website.url).text() === "true" ? console.log(`${website.name} Status: Online`) : console.log(`${website.name} Status: Offline`)
    );
  },
  delay: "30 Seconds",
  autoStart: true
});

// --------------------------------------------------
// Server Start-Up
// --------------------------------------------------

// Teapot Easter Egg
app.get(/\/teapot|\/418/, (req, res) => res.status(418).sendFile(`${cwd}/error/418.html`));

// 404 Message
app.all("*", (req, res) => res.status(404).sendFile(`${cwd}/error/404.html`));

// Server Start
app.listen(port, () => console.log(`Server Started on Port ${port}`));

// --------------------------------------------------
// Server Error Logging
// --------------------------------------------------

export function error(errMsg: string) {
  const timeStrings = `CST: ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })}\nEST: ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}\n\n`;
  const SEPERATOR = "--------------------------------------------------"

  errorStream.write(`${SEPERATOR}\n${timeStrings}${errMsg}\n${SEPERATOR}\n`);
  console.error(`${chalk.red(SEPERATOR)}\n${timeStrings}${errMsg}\n${chalk.red(SEPERATOR)}`);
}

process.on("uncaughtException", (err, origin) => {
  error(`Uncaught Exception: \n${JSON.stringify(err, null, 2)}\n\nOrigin: \n${JSON.stringify(origin, null, 2)}`);
});

process.on("unhandledRejection", (err, origin) => {
  error(`Unhandled Rejection: \n${JSON.stringify(err, null, 2)}\n\nOrigin: \n${JSON.stringify(origin, null, 2)}`);
});

// --------------------------------------------------
// Custom Types
// --------------------------------------------------

declare module "express-session" {
  interface SessionData {
    user: {
      username?: string;
    }
  }
}