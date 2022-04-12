//! CODE NOT IN USE: -----          import SMTPTransport from "nodemailer/lib/smtp-transport";
//! CODE NOT IN USE: -----          import { createTransport } from "nodemailer";
//! CODE NOT IN USE: -----          import { error } from "./index";
//! CODE NOT IN USE: -----          import { google } from "googleapis";
//! CODE NOT IN USE: -----          import config from "./config";
//! CODE NOT IN USE: -----          
//! CODE NOT IN USE: -----          // --------------------------------------------------
//! CODE NOT IN USE: -----          // Initialization
//! CODE NOT IN USE: -----          // --------------------------------------------------
//! CODE NOT IN USE: -----          
//! CODE NOT IN USE: -----          const OAuth2 = google.auth.OAuth2;
//! CODE NOT IN USE: -----          const oauth2Client = new OAuth2(
//! CODE NOT IN USE: -----            config.secrets.clientID,
//! CODE NOT IN USE: -----            config.secrets.clientSecret,
//! CODE NOT IN USE: -----            "http://localhost:3000/api/gmail-request"
//! CODE NOT IN USE: -----          );
//! CODE NOT IN USE: -----          
//! CODE NOT IN USE: -----          const scopes = [
//! CODE NOT IN USE: -----            "https://www.googleapis.com/auth/gmail.send",
//! CODE NOT IN USE: -----            "https://www.googleapis.com/auth/gmail.compose"
//! CODE NOT IN USE: -----          ];
//! CODE NOT IN USE: -----          
//! CODE NOT IN USE: -----          const url = oauth2Client.generateAuthUrl({
//! CODE NOT IN USE: -----            access_type: "online",
//! CODE NOT IN USE: -----            scope: scopes
//! CODE NOT IN USE: -----          });
//! CODE NOT IN USE: -----          
//! CODE NOT IN USE: -----          console.log(`Authorize this app by visiting this url: ${url}`);
//! CODE NOT IN USE: -----          
//! CODE NOT IN USE: -----          
//! CODE NOT IN USE: -----          // --------------------------------------------------
//! CODE NOT IN USE: -----          // Email
//! CODE NOT IN USE: -----          // --------------------------------------------------
//! CODE NOT IN USE: -----          
//! CODE NOT IN USE: -----          export async function sendEmail(emailContent: EmailContent) {
//! CODE NOT IN USE: -----            transport.sendMail({
//! CODE NOT IN USE: -----              from: `"${emailContent.from}" <${config.secrets.user}>`,
//! CODE NOT IN USE: -----              to: emailContent.to,
//! CODE NOT IN USE: -----              subject: emailContent.subject,
//! CODE NOT IN USE: -----              html: emailContent.html
//! CODE NOT IN USE: -----            }, (err: Error | null, info) => {
//! CODE NOT IN USE: -----              if (err) {
//! CODE NOT IN USE: -----                error(`Error sending email: ${err}`);
//! CODE NOT IN USE: -----              } else {
//! CODE NOT IN USE: -----                console.log('Email sent: ' + info.response);
//! CODE NOT IN USE: -----              }
//! CODE NOT IN USE: -----            });
//! CODE NOT IN USE: -----           
//! CODE NOT IN USE: -----          }
//! CODE NOT IN USE: -----          
//! CODE NOT IN USE: -----          // --------------------------------------------------
//! CODE NOT IN USE: -----          // Custom Types
//! CODE NOT IN USE: -----          // --------------------------------------------------
//! CODE NOT IN USE: -----          
//! CODE NOT IN USE: -----          interface EmailContent {
//! CODE NOT IN USE: -----            from: string;
//! CODE NOT IN USE: -----            to: string;
//! CODE NOT IN USE: -----            subject: string;
//! CODE NOT IN USE: -----            html: string;
//! CODE NOT IN USE: -----          }
//! CODE NOT IN USE: -----          