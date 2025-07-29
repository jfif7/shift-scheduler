"""
FastAPI application for CP-SAT scheduler server
"""

import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from contextlib import asynccontextmanager
import time
from datetime import datetime
import logging
from typing import AsyncGenerator, Optional

from prometheus_client import (
    Counter,
    Histogram,
    Gauge,
    generate_latest,
    CONTENT_TYPE_LATEST,
    CollectorRegistry,
)

from models import (
    GenerateScheduleRequest,
    GenerateScheduleResponse,
    HealthResponse,
    SolverStatusResponse,
)
from services.cp_sat_solver import ScheduleSolver

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Prometheus metrics - handle duplicates with try-catch
REQUEST_COUNT: Optional[Counter] = None
REQUEST_DURATION: Optional[Histogram] = None
ACTIVE_REQUESTS: Optional[Gauge] = None
SOLVER_STATUS: Optional[Gauge] = None
SOLVE_DURATION: Optional[Histogram] = None
SCHEDULE_SUCCESS_RATE: Optional[Counter] = None

registry = CollectorRegistry()

try:
    REQUEST_COUNT = Counter(
        "http_requests_total",
        "Total HTTP requests",
        ["method", "endpoint", "status_code"],
        registry=registry,
    )

    REQUEST_DURATION = Histogram(
        "http_request_duration_seconds",
        "HTTP request duration in seconds",
        ["method", "endpoint"],
        registry=registry,
    )

    ACTIVE_REQUESTS = Gauge(
        "http_active_requests", "Number of active HTTP requests", registry=registry
    )

    SOLVER_STATUS = Gauge(
        "solver_status",
        "Solver availability status (1=available, 0=unavailable)",
        registry=registry,
    )

    SOLVE_DURATION = Histogram(
        "schedule_solve_duration_seconds",
        "Time spent solving scheduling problems",
        registry=registry,
    )

    SCHEDULE_SUCCESS_RATE = Counter(
        "schedule_generation_total",
        "Total schedule generation attempts",
        ["status"],
        registry=registry,
    )
except ValueError as e:
    print(e)

# Global solver instance
solver_instance: Optional[ScheduleSolver] = None
current_requests: int = 0
max_concurrent_requests: int = 10


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan management"""
    global solver_instance

    # Startup
    logger.info("Starting CP-SAT Scheduler Server...")
    solver_instance = ScheduleSolver()
    logger.info("Server started successfully")

    yield

    # Shutdown
    logger.info("Shutting down server...")


# Create FastAPI app
app = FastAPI(
    title="CP-SAT Employee Scheduler",
    description="Employee scheduling service using Google OR-Tools CP-SAT solver",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next) -> Response:
    """Log requests and track concurrent requests with metrics"""
    global current_requests

    start_time: float = time.time()
    method: str = request.method
    path: str = request.url.path

    current_requests += 1
    if ACTIVE_REQUESTS:
        ACTIVE_REQUESTS.set(current_requests)

    try:
        response = await call_next(request)
        process_time: float = time.time() - start_time

        # Record metrics
        if REQUEST_COUNT:
            REQUEST_COUNT.labels(
                method=method, endpoint=path, status_code=response.status_code
            ).inc()
        if REQUEST_DURATION:
            REQUEST_DURATION.labels(method=method, endpoint=path).observe(process_time)

        logger.info(
            f"{request.method} {request.url.path} - "
            f"Status: {response.status_code} - "
            f"Time: {process_time:.3f}s - "
            f"Concurrent: {current_requests}"
        )

        response.headers["X-Process-Time"] = str(process_time)
        return response

    except Exception as e:
        process_time: float = time.time() - start_time
        if REQUEST_COUNT:
            REQUEST_COUNT.labels(method=method, endpoint=path, status_code=500).inc()
        if REQUEST_DURATION:
            REQUEST_DURATION.labels(method=method, endpoint=path).observe(process_time)

        logger.error(f"Request error: {str(e)} - Time: {process_time:.3f}s")
        raise

    finally:
        current_requests -= 1
        if ACTIVE_REQUESTS:
            ACTIVE_REQUESTS.set(current_requests)


@app.get("/", response_class=JSONResponse)
async def root() -> dict[str, str]:
    """Root endpoint"""
    return {
        "service": "CP-SAT Employee Scheduler",
        "version": "1.0.0",
        "status": "running",
        "docs_url": "/docs",
    }


@app.get("/metrics")
async def metrics() -> Response:
    """Prometheus metrics endpoint"""
    return Response(generate_latest(registry=registry), media_type=CONTENT_TYPE_LATEST)


@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint"""
    if SOLVER_STATUS:
        SOLVER_STATUS.set(1)  # Mark solver as healthy
    return HealthResponse(
        status="healthy", timestamp=datetime.now().isoformat(), version="1.0.0"
    )


@app.get("/api/v1/solver/status", response_model=SolverStatusResponse)
async def solver_status() -> SolverStatusResponse:
    """Get solver status and capabilities"""
    try:
        # Try to import ortools to check if it's available
        from ortools.sat.python import cp_model

        solver_available: bool = True
        solver_version: str = "9.8.3296"  # Update with actual version detection
        if SOLVER_STATUS:
            SOLVER_STATUS.set(1)
    except ImportError:
        solver_available = False
        solver_version = "unavailable"
        if SOLVER_STATUS:
            SOLVER_STATUS.set(0)

    return SolverStatusResponse(
        available=solver_available,
        current_load=current_requests,
        max_concurrent=max_concurrent_requests,
        solver_version=solver_version,
    )


@app.post("/api/v1/schedule/generate", response_model=GenerateScheduleResponse)
async def generate_schedule(
    request: GenerateScheduleRequest,
) -> GenerateScheduleResponse:
    """Generate schedule using CP-SAT solver with JSON"""
    global current_requests, max_concurrent_requests

    # Check server capacity
    if current_requests >= max_concurrent_requests:
        raise HTTPException(
            status_code=503, detail="Server at capacity. Please try again later."
        )

    if not solver_instance:
        logger.error("Solver not initialized")
        if SCHEDULE_SUCCESS_RATE:
            SCHEDULE_SUCCESS_RATE.labels(status="error").inc()
        raise HTTPException(status_code=500, detail="Solver not initialized")

    try:
        logger.info(
            f"Generating schedule for {len(request.employees)} employees, {request.selected_year}/{request.selected_month + 1}"
        )

        # Track solve time
        solve_start: float = time.time()

        # Solve the scheduling problem
        result: GenerateScheduleResponse = solver_instance.solve_schedule(
            employees=request.employees,
            constraints=request.constraints,
            settings=request.settings,
            month=request.selected_month,
            year=request.selected_year,
            timeout=request.timeout,
        )

        # Record metrics
        solve_time: float = time.time() - solve_start
        if SOLVE_DURATION:
            SOLVE_DURATION.observe(solve_time)

        if result.success:
            if SCHEDULE_SUCCESS_RATE:
                SCHEDULE_SUCCESS_RATE.labels(status="success").inc()
        else:
            if SCHEDULE_SUCCESS_RATE:
                SCHEDULE_SUCCESS_RATE.labels(status="failed").inc()

        logger.info(
            f"Schedule generation completed: success={result.success}, status={result.metadata.solver_status}, solve_time={solve_time:.3f}s"
        )
        return result

    except Exception as e:
        if SCHEDULE_SUCCESS_RATE:
            SCHEDULE_SUCCESS_RATE.labels(status="error").inc()
        logger.error(f"Error generating schedule: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    # Get port from environment
    port: int = int(os.getenv("PORT", "8211"))

    logger.info(f"Starting HTTP server on port {port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False, log_level="info")
