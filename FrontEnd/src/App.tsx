import "./App.css";
import { HomePage } from "./HomePage";
import { ChatBox } from "./ChatBox";
function App() {
  return (
    <>
      <div className="app-container">
        <HomePage />
        <ChatBox />
      </div>
    </>
  );
}

export default App;
