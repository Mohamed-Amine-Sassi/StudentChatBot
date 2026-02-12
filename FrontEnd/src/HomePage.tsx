import { useState } from "react";
import axios from "axios";

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
    } catch (error) {
      console.error("Error updating:", error);
    }
  };

  return (
    <>
      <h2>Document to ask about:</h2>
      <input type="file" name="" onChange={handlePDF} id="" />
      {pdfFile && <p>Selected file: {pdfFile.name}</p>}
      <input type="button" value="Send File" onClick={() => sendPDF(pdfFile)} />
    </>
  );
}
