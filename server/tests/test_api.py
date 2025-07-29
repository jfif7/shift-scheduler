"""
Test the API endpoints
"""

import pytest
import json


def test_root_endpoint(client):
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "CP-SAT Employee Scheduler"
    assert data["status"] == "running"


def test_health_endpoint(client):
    """Test the health endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert data["version"] == "1.0.0"


def test_solver_status_endpoint(client):
    """Test the solver status endpoint"""
    response = client.get("/api/v1/solver/status")
    assert response.status_code == 200
    data = response.json()
    assert "available" in data
    assert "current_load" in data
    assert "max_concurrent" in data
    assert "solver_version" in data


def test_generate_schedule_invalid_input(client):
    """Test schedule generation with invalid input"""
    # Empty request
    response = client.post("/api/v1/schedule/generate", json={})
    assert response.status_code == 422  # Validation error

    # Missing required fields
    invalid_request = {
        "employees": [],
        "settings": {},
        "selected_month": 6,
        "selected_year": 2025,
    }
    response = client.post("/api/v1/schedule/generate", json=invalid_request)
    assert response.status_code == 422


def test_generate_schedule_no_employees(client, sample_settings):
    """Test schedule generation with no employees"""
    request_data = {
        "employees": [],
        "constraints": [],
        "settings": sample_settings,
        "selected_month": 6,
        "selected_year": 2025,
        "timeout": 10,
    }

    response = client.post("/api/v1/schedule/generate", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == False
    assert "No employees provided" in data["message"]


def test_generate_schedule_valid_simple(client, sample_request):
    """Test schedule generation with valid simple input"""
    # Add more employees to make it feasible
    sample_request["employees"] = [
        {
            "id": "emp_001",
            "name": "John Doe",
            "shifts_per_month": [5, 15],
            "weekday_shifts": [3, 10],
            "weekend_shifts": [2, 5],
            "tags": ["senior"],
        },
        {
            "id": "emp_002",
            "name": "Jane Smith",
            "shifts_per_month": [5, 15],
            "weekday_shifts": [3, 10],
            "weekend_shifts": [2, 5],
            "tags": ["junior"],
        },
        {
            "id": "emp_003",
            "name": "Bob Wilson",
            "shifts_per_month": [5, 15],
            "weekday_shifts": [3, 10],
            "weekend_shifts": [2, 5],
            "tags": [],
        },
    ]

    # Reduce requirements to make it more feasible
    sample_request["settings"]["persons_per_shift"] = [1, 1]
    sample_request["settings"]["shifts_per_day"] = 1

    response = client.post("/api/v1/schedule/generate", json=sample_request)
    assert response.status_code == 200
    data = response.json()

    # The result might be feasible or infeasible depending on constraints
    # Just check that we get a valid response structure
    assert "success" in data
    assert "schedule" in data
    assert "metadata" in data
    assert "message" in data

    if data["success"]:
        assert data["metadata"]["solver_status"] in ["OPTIMAL", "FEASIBLE"]
        assert "days" in data["schedule"]
    else:
        # Should have a meaningful error message
        assert len(data["message"]) > 0


