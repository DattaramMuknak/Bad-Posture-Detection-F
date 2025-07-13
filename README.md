# 🎯 Bad Posture Detection Frontend (React)

This is the **frontend app** for a posture detection system built using **React**, **Webcam.js**, and **Axios**. It allows users to:

- 📤 Upload a video for posture analysis  
- 🎥 Use their **webcam for live feedback**  
- 🔍 View per-frame posture feedback

---

## 🚀 Live Demo

Deployed on Vercel: [https://bad-posture-detection-six.vercel.app](https://bad-posture-detection-six.vercel.app/)

---

## 📦 Installation

```bash
git clone https://github.com/your-username/posture-frontend.git
npm install

🛠️ Environment Variables
Create a .env file in the root of your React project:
REACT_APP_BACKEND_VIDEO_URL=https://69dbe62bb51e.ngrok-free.app/analyze-video
REACT_APP_BACKEND_FRAME_URL=https://69dbe62bb51e.ngrok-free.app/analyze-frame

▶️ Run Locally

npm start
App will be available at:
http://localhost:3000

🚀 Deploy to Vercel
1. Push your project to GitHub
git init
git remote add origin https://github.com/your-username/posture-frontend.git
git add .
git commit -m "Initial commit"
git push -u origin main

2. Deploy via Vercel
Go to https://vercel.com
Sign in with GitHub
Import your repo
Add .env variables from above in the "Environment Variables" section
Click Deploy

🌟 Features

Upload video for detailed posture feedback
Live webcam-based posture detection
Fast, responsive UI with live issue highlighting
Works with local ngrok or deployed backend

🧠 Backend Required

Make sure your backend is running and exposed via:
https://your-backend-url.com/analyze-video
https://your-backend-url.com/analyze-frame

📸 Powered By

React
Axios
react-webcam
FastAPI backend (MediaPipe + OpenCV)

📬 Support
Need help? DM me or raise an issue.
Enjoy the posture correction revolution! 💪
