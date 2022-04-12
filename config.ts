import secrets from "./secrets.json";

const config = {
  port: 3000,
  secrets: secrets,
  websites: [
    {
      url: "https://www.cookiegamer733.dev/status",
      name: "Cookie's Website"
    },
    {
      url: "https://rick-astley-bot.archigan.repl.co/",
      name: "Archigan's Bot"
    },
    {
      url: "https://walker-chatroom.archigan.repl.co/status.txt",
      name: "Walker Chatroom"
    },
    {
      url: "https://akalyzziechatbot.archigan.repl.co/",
      name: "Lyzzie's Chatbot"
    }
  ]
};

export default config;