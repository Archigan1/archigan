import { createTransport } from "nodemailer";
import { error } from "./index";
import config from "./config";
import Interval from "jsinterval";
import miniget from "miniget";
// --------------------------------------------------
// Initialization
// --------------------------------------------------

const transport = createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'OAuth2',
    user: config.secrets.user,
    clientId: config.secrets.clientID,
    clientSecret: config.secrets.clientSecret,
    refreshToken: config.secrets.refreshToken,
    accessToken: config.secrets.accessToken,
    expires: 1649013938461
  }
});

// refresh gmail api access token
const refreshToken = async () => {
  const response = miniget(`https://www.googleapis.com/oauth2/v4/token?client_id=${config.secrets.clientID}&client_secret=${config.secrets.clientSecret}&refresh_token=${config.secrets.refreshToken}&grant_type=refresh_token`);
  const json = JSON.parse(await response.text());
  config.secrets.accessToken = json.access_token;
};

new Interval({
  func: () => {
    refreshToken();
  },
  delay: "30 Minutes",
  autoStart: true
})

// --------------------------------------------------
// Email
// --------------------------------------------------

export function sendEmail(emailContent: EmailContent) {
  transport.sendMail({
    from: `"${emailContent.from}" <${config.secrets.user}>`,
    to: emailContent.to,
    subject: emailContent.subject,
    html: emailContent.html
  }, (err: Error | null, info: SentMessageInfo) => {
    if (err) {
      error(`Error sending email: ${err}`);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

// --------------------------------------------------
// Custom Types
// --------------------------------------------------

interface EmailContent {
  from: string;
  to: string;
  subject: string;
  html: string;
}

interface SentMessageInfo {
  envelope: {
    from: string | false;
    to: string[];
  };
  messageId: string;
  response: string;
}
