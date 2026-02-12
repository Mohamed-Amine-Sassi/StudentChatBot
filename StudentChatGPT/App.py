from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import re
import os
import chromadb
from scipy.spatial import distance
import ollama
from dotenv import load_dotenv
load_dotenv()

os.environ["HF_HOME"] = os.path.join(os.getcwd(), ".hf_cache")


from sentence_transformers import SentenceTransformer 


embed_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
clientChroma=chromadb.PersistentClient(path="./ChromaDB/")


app = Flask(__name__)
CORS(app,origins=[os.getenv("Origin")])  

@app.route(os.getenv("ChatAppURL"), methods=["POST"])
def home():
    #handling user questions 
    data=request.get_json()
    question =data.get("question")
    embeddedQuestion=embedText(question)
    #retrieving list of most relevent chunks
    returnedChunks=mostReleventChunks(embeddedQuestion)
    finalRespond=generateFinalResponse(returnedChunks,question)
    return jsonify({"answer": f"{finalRespond}"})

@app.route(os.getenv("embedURL"),methods=["POST"])
def embed():
    text = ""
    with pdfplumber.open("./PDF_Files/DocumentToAnswerFrom.pdf") as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    if not text.strip():
         print( "Text is empty or unreadable")
    else:
         print(f"Length: {len(text)} characters")
    #striped text
    stripedTextNoCar=cleanText(text)
    #list of chunks
    global chunks
    chunks=returnChunks(stripedTextNoCar)
    #list of embedding 
    for txt in chunks:
        txt["Embedding"]=embedText(txt["Text"])
    #creation de collection 
    collection=clientChroma.get_or_create_collection(name="Cours")
    collection.add(ids=[str(chunk["id"]) for chunk in chunks],documents=[chunk["Text"] for chunk in chunks],embeddings=[chunk["Embedding"] for chunk in chunks])
    return jsonify({"message": "Embedding done", "chunks": len(chunks)})


    
def cleanText(text):
    stripedText=[line for line in text.splitlines() if line.strip()]
    textWithoutWeirdcarracters=[re.sub(r"[^a-zA-Z0-9\s.,!?:']", "", line) for line in stripedText  ]
    stripedTextNoCar=[textWithoutWeirdcarracter for textWithoutWeirdcarracter in textWithoutWeirdcarracters if textWithoutWeirdcarracter.strip()]
    return stripedTextNoCar

def returnChunks(stripedTextNoCar):
    fullCleanText=" ".join(stripedTextNoCar)
    listOfFullText=[line for line in fullCleanText.split(" ")]
    chunks=[{"id":i,"Text":" ".join(listOfFullText[chunk:chunk+200])} for i,chunk in enumerate(range(0,len(listOfFullText),150))]
    return chunks

def embedText(txt):
    return embed_model.encode(txt).tolist()

def mostReleventChunks(embeddedQuestion):
    collection = clientChroma.get_collection(name="Cours")
    distances=[]
    allData=collection.get(include=["documents","embeddings"])
    for i in range(len(allData["ids"])):
        dist=distance.cosine(embeddedQuestion,allData["embeddings"][i])
        distances.append({"distance":dist,"index":allData["ids"][i]})
    sortedDistances=sorted(distances,key=lambda x:x["distance"])

    returnedSortedDistances=sortedDistances[:4]
    returnedChunks=[allData["documents"][int(x["index"])] for x in returnedSortedDistances]
    return returnedChunks

def generateFinalResponse(returnedChunks, question):
    systemPrompt = """You are a helpful university tutor for software engineering students.
You will receive:
Context extracted from course documents (PDF chunks)
A student question

Rules:
- Answer ONLY using the provided context.
- If the context does not contain enough information to answer, say clearly: "I don't know based on the provided document."
- Do not invent definitions, formulas, or facts.
- Explain in a clear student-friendly way.
- If useful, give a short example or simple explanation.
- Keep the answer well-structured.
"""

    userPrompt = f"""Here is context extracted from a course document:

[CHUNK 1]
{returnedChunks[0]}

[CHUNK 2]
{returnedChunks[1]}

[CHUNK 3]
{returnedChunks[2]}

[CHUNK 4]
{returnedChunks[3]}

Question: {question}
if the chunks don't have enough content to answer the given question answer with :"I don't know based on the provided document"
"""

    response = ollama.chat(
        model="llama3.2:3b",
        messages=[
            {"role": "system", "content": systemPrompt},
            {"role": "user", "content": userPrompt}
        ]
    )

    return response["message"]["content"]



if __name__ == "__main__":
    app.run(debug=True, port=8000)
