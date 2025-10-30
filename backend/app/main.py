from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from .api import galleries, film_stocks, trips

app = FastAPI(
    title="Photography App API",
    description="Film management system API",
    version="1.0.0",
    root_path_in_servers=False
)

# Trust proxy headers from Railway
@app.middleware("http")
async def add_proxy_headers(request, call_next):
    # Trust X-Forwarded-Proto from Railway proxy
    if "x-forwarded-proto" in request.headers:
        request.scope["scheme"] = request.headers["x-forwarded-proto"]
    response = await call_next(request)
    return response

# CORS middleware - must be added before routes
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https://.*\.railway\.app$|^https://.*\.vercel\.app$|^https://.*\.github\.io$|^http://localhost:\d+$|^http://127\.0\.0\.1:\d+$",
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

