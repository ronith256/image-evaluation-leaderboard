from fastapi import FastAPI, File, UploadFile, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Column, Integer, String, Float, select
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
import os
from typing import List
import torch
from torchvision import transforms
from PIL import Image
from transformers import ViTFeatureExtractor, ViTModel
from torch.nn.functional import cosine_similarity
import pdf2image
import asyncio
from concurrent.futures import ThreadPoolExecutor

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./sql_app.db"
engine = create_async_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(String, index=True)
    student_name = Column(String)
    student_roll_number = Column(String, index=True)
    file_path = Column(String)
    score = Column(Float)

# Pydantic models
class SubmissionCreate(BaseModel):
    template_id: str
    student_name: str
    student_roll_number: str

class SubmissionResponse(BaseModel):
    id: int
    template_id: str
    student_name: str
    student_roll_number: str
    file_path: str
    score: float

# Load the ViT model and feature extractor
model_name = "google/vit-base-patch16-224-in21k"
feature_extractor = ViTFeatureExtractor.from_pretrained(model_name)
model = ViTModel.from_pretrained(model_name)

# Function to get embeddings
def get_embedding(image_path):
    image = Image.open(image_path).convert("RGB")
    inputs = feature_extractor(images=image, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state[:, 0, :]  # Use the [CLS] token as the image embedding

# Function to calculate similarity score
def calculate_similarity(image_path1, image_path2):
    embedding1 = get_embedding(image_path1)
    embedding2 = get_embedding(image_path2)
    similarity = cosine_similarity(embedding1, embedding2).item()
    return (similarity + 1) / 2  # Normalize to [0, 1] range

# Convert PDF to image
def pdf_to_image(pdf_path, output_path):
    images = pdf2image.convert_from_path(pdf_path)
    if images:
        images[0].save(output_path, 'JPEG')
        return output_path
    return None

# Processing queue
processing_queue = asyncio.Queue()
MAX_CONCURRENT_TASKS = 3
executor = ThreadPoolExecutor(max_workers=MAX_CONCURRENT_TASKS)

async def process_queue():
    while True:
        task = await processing_queue.get()
        try:
            await task
        finally:
            processing_queue.task_done()

async def process_submission(submission_id: int):
    async with SessionLocal() as db:
        db_submission = await db.get(Submission, submission_id)
        if not db_submission:
            print(f"Submission {submission_id} not found")
            return

        try:
            # Convert PDF to image
            image_path = await asyncio.get_event_loop().run_in_executor(
                executor, pdf_to_image, db_submission.file_path, f"uploads/{db_submission.id}_image.jpg"
            )
            if not image_path:
                print(f"Failed to convert PDF to image for submission {submission_id}")
                return

            # Calculate similarity score (assuming we have a reference image)
            reference_image = f"{db_submission.template_id}.jpeg"  # You need to provide this
            score = await asyncio.get_event_loop().run_in_executor(
                executor, calculate_similarity, image_path, reference_image
            )
            print(f"Calculated score for submission {submission_id}: {score}")

            # Update database
            db_submission.score = score
            await db.commit()
            print(f"Updated score for submission {submission_id}")
        except Exception as e:
            print(f"Error processing submission {submission_id}: {str(e)}")
            await db.rollback()

@app.post("/submit", response_model=SubmissionResponse)
async def submit(
    background_tasks: BackgroundTasks,
    template_id: str = Form(...),
    student_name: str = Form(...),
    student_roll_number: str = Form(...),
    pdf_file: UploadFile = File(...)
):
    if not pdf_file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Save the file
    file_path = f"uploads/{pdf_file.filename}"
    os.makedirs("uploads", exist_ok=True)
    with open(file_path, "wb") as buffer:
        buffer.write(await pdf_file.read())

    # Save to database
    async with SessionLocal() as db:
        db_submission = Submission(
            template_id=template_id,
            student_name=student_name,
            student_roll_number=student_roll_number,
            file_path=file_path,
            score=0.0  # Initial score
        )
        db.add(db_submission)
        await db.commit()
        await db.refresh(db_submission)

    # Add processing task to queue
    task = process_submission(db_submission.id)
    await processing_queue.put(task)

    return SubmissionResponse(
        id=db_submission.id,
        template_id=db_submission.template_id,
        student_name=db_submission.student_name,
        student_roll_number=db_submission.student_roll_number,
        file_path=db_submission.file_path,
        score=db_submission.score
    )

@app.get("/getdata", response_model=List[SubmissionResponse])
async def get_data(template_id: str):
    async with SessionLocal() as db:
        query = select(Submission).where(Submission.template_id == template_id)
        result = await db.execute(query)
        submissions = result.scalars().all()
        return [
            SubmissionResponse(
                id=submission.id,
                template_id=submission.template_id,
                student_name=submission.student_name,
                student_roll_number=submission.student_roll_number,
                file_path=submission.file_path,
                score=submission.score
            )
            for submission in submissions
        ]

@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    asyncio.create_task(process_queue())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7789)