from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import fitz  # PyMuPDF
import aiofiles
import aiofiles.os
import json
from typing import Optional, Dict

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CACHE_FILE = "cache.json"
cache_lock = asyncio.Lock()

class ChatRequest(BaseModel):
    message: str

async def read_cache() -> Dict[str, str]:
    await asyncio.sleep(2)
    # simulazione della chiamata API
    async with cache_lock:
        try:
            async with aiofiles.open(CACHE_FILE, 'r') as f:
                data = await f.read()
                return json.loads(data or '{}')
        except FileNotFoundError:
            return {}

async def write_cache(cache: Dict[str, str]) -> None:
    await asyncio.sleep(2)
    # simulazione della chiamata API
    async with cache_lock:
        tmp = f"{CACHE_FILE}.tmp"
        async with aiofiles.open(tmp, 'w') as f:
            await f.write(json.dumps(cache))
        await aiofiles.os.replace(tmp, CACHE_FILE)

@app.post("/chat")
async def chat_endpoint(message: str = Form(...), file: Optional[UploadFile] = File(None)) -> Dict[str, str]:
    cache = await read_cache()
    if message in cache:
        return {"message": f"Risposta da cache: {cache[message]}"}

    if file:
        content = await file.read()
        doc = fitz.open(stream=content, filetype="pdf")
        text = "".join(page.get_text('text') for page in doc)
        words = text.split()
        preview = ' '.join(words[:100])
        reply = f"Risposta da file: {preview}"
    else:
        reply = f"Risposta generata: {message}"

    cache[message] = reply
    await write_cache(cache)
    return {"message": reply}

# Per avviare:
# uvicorn main:app --reload --host 0.0.0.0 --port 5000

