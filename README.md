# Token-Flow
![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/frontend-React-blue)
![FastAPI](https://img.shields.io/badge/backend-FastAPI-green)
TokenGuard is a full-stack application that helps developers track, analyze, and optimize API usage across multiple LLM providers. It provides real-time insights into token consumption, usage percentage, remaining quota, and cost analytics, along with smart alerts to prevent overuse and unexpected billing.
TokenGuard is a multi-LLM API usage monitoring platform designed to give developers complete visibility into their AI API consumption. The system integrates with providers like Grok, OpenAI, and Gemini to track token usage, calculate costs, and monitor limits in real time. It features an interactive dashboard with charts, usage alerts, and automated notifications when thresholds are exceeded. Built using React and FastAPI, the platform helps optimize API usage, reduce costs, and improve efficiency in AI-powered applications.
# 🚀 TokenGuard – Multi-LLM API Usage Tracker

> Track. Analyze. Optimize your AI API usage.

TokenGuard is a full-stack application that helps developers monitor API usage, token consumption, and costs across multiple LLM providers like Grok, OpenAI, and Gemini. It provides real-time analytics, alerts, and a visual dashboard to prevent overuse and unexpected billing.

---

## 📸 Demo Preview
<!-- Add screenshots here -->
![Dashboard Screenshot](./assets/dashboard.png)

---

## 🔥 Features

- 📊 Real-time API usage tracking
- 🤖 Multi-LLM support (Grok, OpenAI, Gemini)
- 💰 Cost monitoring & estimation
- ⚠️ Smart alerts (80% warning, 95% critical)
- 📈 Interactive charts (Bar, Pie, Line)
- 🔄 Auto-refresh dashboard
- 🔐 Secure API key handling (.env)
- 🧠 Usage insights & analytics

---

## 🧱 Tech Stack

### 🖥️ Frontend
- React (Vite)
- Tailwind CSS
- Recharts
- Axios

### ⚙️ Backend
- FastAPI
- Python
- REST APIs

### 🗄️ Optional (Future)
- PostgreSQL / Firebase

---
llm-usage-tracker/
│
├── backend/
│ ├── main.py
│ ├── routes/
│ ├── services/
│ └── requirements.txt
│
├── frontend/
│ ├── src/
│ ├── components/
│ └── package.json
│
├── .gitignore
├── LICENSE
└── README.md

---

## ⚙️ Installation & Setup

### 🔽 1. Clone the Repository

```bash
git clone https://github.com/your-username/llm-usage-tracker.git
cd llm-usage-tracker
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
{
  "providers": [
    {
      "name": "Grok",
      "tokens_used": 12000,
      "limit": 20000,
      "cost": 3.5
    },
    {
      "name": "OpenAI",
      "tokens_used": 8000,
      "limit": 15000,
      "cost": 2.1
    }
  ]
}
📜 License

This project is licensed under the MIT License.
👨‍💻 Author

Madesh S

## 📂 Project Structure
