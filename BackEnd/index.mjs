import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";

const PORT = 8000;
const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.post("/api/sendPdf", upload.single("pdf"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const filePath = path.join(
    "../StudentChatGPT/PDF_Files",
    "DocumentToAnswerFrom.pdf",
  );
  fs.writeFileSync(filePath, req.file.buffer);
  console.log("Received file:", req.file);
  return res.status(200).json({ message: "Received file" });
});

app.listen(PORT, () => console.log(`server connected on port ${PORT}`));
