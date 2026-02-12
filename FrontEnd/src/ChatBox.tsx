import axios from "axios";
import { useState } from "react";

export function ChatBox() {
  const [question, setQuestions] = useState("");
  const [textArea, setTextArea] = useState("");

  const getAnswer = async (Q: string) => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/ChatApp", {
        question: Q,
      });
      console.log(response.data.answer);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div>
        <textarea name="" id="" rows={20} value={textArea} readOnly></textarea>
        <div
          style={{
            display: "block",
          }}
        >
          <input
            type="text"
            onChange={(e) => {
              setQuestions(e.target.value);
            }}
          />
          <input
            type="button"
            value="Send Question"
            onClick={() => {
              getAnswer(question);
            }}
          />
        </div>
      </div>
    </>
  );
}
