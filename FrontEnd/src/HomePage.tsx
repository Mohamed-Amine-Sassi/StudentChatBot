import { useState } from "react";
import axios from "axios";
import "./App.css";

export function HomePage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handlePDF = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      console.log("PDF selected:", file);
    } else {
      alert("Please upload a valid PDF file");
    }
  };

  const sendPDF = async (file: File | null) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("pdf", file);
    try {
      const res = await axios.post(
        "http://localhost:8000/api/sendPdf",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      console.log("PDF Sent:", res.data);
      const embedPDF = await axios.post("http://127.0.0.1:8000/embed", {});
      console.log(embedPDF);
    } catch (error) {
      console.error("Error updating:", error);
    }
  };

  return (
    <>
      <div className="home-page">
        <h2>📄 Document to Ask About</h2>
        <div className="pdf-upload-section">
          <label htmlFor="pdf-input" className="file-input-label">
            📁 Click to select or drag & drop a PDF file
          </label>
          <input
            type="file"
            id="pdf-input"
            onChange={handlePDF}
            accept=".pdf"
          />

          {pdfFile && <div className="file-selected">{pdfFile.name}</div>}

          <button
            className="btn btn-primary btn-block"
            onClick={() => sendPDF(pdfFile)}
            disabled={!pdfFile}
          >
            📤 Send File
          </button>
        </div>
      </div>
    </>
  );
}
