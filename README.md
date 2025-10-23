# Raphaël, AI Chatbot

This project is a simple AI chatbot web application built with a React frontend and a Node.js (Express) backend. It uses the OpenAI API to generate responses, providing a conversational interface similar to ChatGPT.

![social-preview](https://github.com/lyamtorres/ai-chatbot/blob/main/social-preview.png)

## Features

- Modern React frontend (with Vite)
- Express backend API
- Integration with OpenAI's GPT models
- Real-time chat interface

## Getting Started

Follow these steps to run the project locally:

### 1. Clone the Repository

```sh
git clone https://github.com/lyamtorres/ai-chatbot.git
cd ai-chatbot
```

### 2. Set Up the Backend

1. Go to the backend folder:

    ```sh
    cd backend
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Create a `.env` file based on the provided example:

    ```sh
    cp .env.example .env
    ```

4. Add your OpenAI API key to the `.env` file:

    ```
    OPENAI_API_KEY=your_openai_api_key_here
    ```

5. Start the backend server:

    ```sh
    npm start
    ```

   The backend will run at [http://localhost:3000](http://localhost:3000).

### 3. Set Up the Frontend

1. Open a new terminal and go to the frontend folder:

    ```sh
    cd frontend
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Start the frontend development server:

    ```sh
    npm run dev
    ```

   The frontend will run at [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

### 4. Usage

- Open [http://localhost:5173](http://localhost:5173) in your browser.
- Type a message and interact with the AI chatbot!
