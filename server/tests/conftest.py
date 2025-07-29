"""
Test configuration and fixtures
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add the server directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app


@pytest.fixture
def client():
    """Create a test client with properly initialized solver"""
    # Initialize the solver before creating the test client
    import main
    from services import ScheduleSolver

    # Ensure solver is initialized
    main.solver_instance = ScheduleSolver()

    return TestClient(app)


@pytest.fixture
def sample_employee():
    """Sample employee data"""
    return {
        "id": "emp_001",
        "name": "John Doe",
        "shifts_per_month": [10, 20],
        "weekday_shifts": [8, 15],
        "weekend_shifts": [2, 5],
        "tags": ["senior", "manager"],
    }


@pytest.fixture
def sample_constraint():
    """Sample constraint data"""
    return {
        "id": "const_001",
        "employee_id": "emp_001",
        "type": "avoid",
        "date": 15,
        "shift_index": 0,
    }


@pytest.fixture
def sample_settings():
    """Sample schedule settings"""
    return {
        "shifts_per_day": 2,
        "persons_per_shift": [2, 1],
        "max_consecutive_shifts": 3,
        "max_consecutive_days": 5,
        "min_rest_days_between_shifts": 1,
        "prevent_multiple_shifts_per_day": True,
        "max_shifts_per_week": 6,
        "min_shifts_per_week": 2,
        "even_distribution": True,
        "shift_labels": ["Morning", "Evening"],
    }


@pytest.fixture
def sample_request(sample_employee, sample_constraint, sample_settings):
    """Sample complete request"""
    return {
        "employees": [sample_employee],
        "constraints": [sample_constraint],
        "settings": sample_settings,
        "selected_month": 6,  # July (0-based)
        "selected_year": 2025,
        "timeout": 10,
    }
