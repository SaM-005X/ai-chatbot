import { useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "AI",
      text: "Hello! How can I help you today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!message.trim() || isLoading) {
      return;
    }

    const userMessage = {
      sender: "You",
      text: message,
    };

    const userInput = message;

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ]);

    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userInput,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from backend");
      }

      const data = await response.json();

      const aiMessage = {
        sender: "AI",
        text: data.response,
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        aiMessage,
      ]);
    } catch (error) {
      console.error("Error:", error);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          sender: "AI",
          text: "Sorry, I could not connect to the backend.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="chat-header">
        <h1>AI Chatbot</h1>
        <p>Your AI assistant</p>
      </header>

      <main className="chat-area">
        {messages.map((chatMessage, index) => (
          <div
            key={index}
            className={`message ${
              chatMessage.sender === "You"
                ? "user-message"
                : "assistant-message"
            }`}
          >
            <strong>{chatMessage.sender}</strong>
            <ReactMarkdown>{chatMessage.text}</ReactMarkdown>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant-message">
            <strong>AI</strong>
            <p>Thinking...</p>
          </div>
        )}
      </main>

      <form className="chat-input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={isLoading}
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default App;