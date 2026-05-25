from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
from supabase import create_client
from pydantic import BaseModel
import os

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)


# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

class DocumentRequest(BaseModel):
    title: str
    content: str
class SearchRequest(BaseModel):
    query: str

@app.get("/")
def read_root():
    return {"message": "Semantic Search API is running!"}

@app.post("/documents")
def add_document(request: DocumentRequest):

    # Step 1: Convert content to embeddings
    embedding = model.encode(request.content).tolist()

    # Step 2: Save to Supabase
    supabase.schema("project3").table("documents").insert({
        "title": request.title,
        "content": request.content,
        "embedding": embedding
    }).execute()

    # Step 3: Return Success
    return {
        "message": "Document Uploaded"
    }

@app.post("/search")
def search_documents(request: SearchRequest):
    
    # Step 1: Convert query to embeddings
    embeddings = model.encode(request.query).tolist()

    # Step 2: Search Supabase
    results = supabase.schema("project3").rpc("match_documents", {
        "query_embedding": embeddings,
        "match_count": 5
    }).execute()

    # Only show similarites above 0.3
    filtered = [r for r in results.data if r ["similarity"] > 0.3]

    # Step 3: return
    return {
        "results": filtered
    }
