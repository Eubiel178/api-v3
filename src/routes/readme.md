<!-- {
  "version": 2,  "devCommand": "next dev"
,
  "builds": [{ "use": "@vercel/node" }],
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "routes": [
    {
      "src": "/api/send-reminders",
      "dest": "/api/send-reminders.js"
    },
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ],
  "crons": [
    {
      "path": "/api/send-reminders",
      "schedule": "0 3 * * *"
    },
    {
      "path": "/api/send-reminders",
      "schedule": "0 17 * * *"
    }
  ]
} -->
