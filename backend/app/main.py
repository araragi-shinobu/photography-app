from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import galleries, film_stocks, trips

app = FastAPI(
    title="Photography App API",
    description="Film management system API",
    version="1.0.0"
)

# CORS middleware - must be added before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Include routers
app.include_router(galleries.router, prefix="/api/galleries", tags=["galleries"])
app.include_router(film_stocks.router, prefix="/api/film-stocks", tags=["film-stocks"])
app.include_router(trips.router, prefix="/api/trips", tags=["trips"])


@app.get("/")
def read_root():
    return {
        "message": "Photography App API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}

