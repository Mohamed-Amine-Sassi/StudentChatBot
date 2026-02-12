import axios from "axios";
import { useState } from "react";
import "./App.css";

export function ChatBox() {
  const [question, setQuestions] = useState("");
  const [textArea, setTextArea] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getAnswer = async (Q: string) => {
    setIsLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/ChatApp", {
        question: Q,
      });
      setTextArea(response.data.answer);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-box">
      <textarea
        className="chat-display"
        rows={20}
        value={textArea}
        readOnly
      ></textarea>
      <div className="chat-input-section">
        <input
          className="input-field"
          type="text"
          onChange={(e) => {
            setQuestions(e.target.value);
          }}
        />
        <input
          className="btn btn-primary"
          type="button"
          value="Send Question"
          onClick={() => {
            getAnswer(question);
          }}
        />
        {isLoading && (
          <>
            <span className="spinner"></span>
            Sending...
          </>
        )}
      </div>
    </div>
  );
}
