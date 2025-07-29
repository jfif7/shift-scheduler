"""
Date utility functions for schedule generation
"""

import calendar
from datetime import datetime, date
from typing import Tuple


def get_days_in_month(month: int, year: int) -> int:
    """
    Get the number of days in a given month and year.

    Args:
        month: Month (0-11, where 0=January)
        year: Year (e.g., 2025)

    Returns:
        Number of days in the month
    """
    # Convert from 0-based to 1-based month for calendar module
    return calendar.monthrange(year, month + 1)[1]


def get_first_day_of_month(month: int, year: int) -> int:
    """
    Get the day of week for the first day of the month.

    Args:
        month: Month (0-11, where 0=January)
        year: Year (e.g., 2025)

    Returns:
        Day of week (0=Monday, 6=Sunday)
    """
    # Convert from 0-based to 1-based month
    first_day = date(year, month + 1, 1)
    return first_day.weekday()


def is_weekend(day: int, month: int, year: int) -> bool:
    """
    Check if a given day is a weekend (Saturday or Sunday).

    Args:
        day: Day of month (1-31)
        month: Month (0-11, where 0=January)
        year: Year (e.g., 2025)

    Returns:
        True if weekend, False otherwise
    """
    # Convert from 0-based to 1-based month
    date_obj = date(year, month + 1, day)
    # weekday() returns 0=Monday to 6=Sunday
    return date_obj.weekday() >= 5  # Saturday=5, Sunday=6


def get_month_name(month: int) -> str:
    """
    Get the month name from month number.

    Args:
        month: Month (0-11, where 0=January)

    Returns:
        Month name
    """
    months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]
    return months[month]


def validate_date(day: int, month: int, year: int) -> bool:
    """
    Validate if a date is valid.

    Args:
        day: Day of month (1-31)
        month: Month (0-11, where 0=January)
        year: Year (e.g., 2025)

    Returns:
        True if valid date, False otherwise
    """
    try:
        # Convert from 0-based to 1-based month
        date(year, month + 1, day)
        return True
    except ValueError:
        return False


def get_weekdays_and_weekends_in_month(month: int, year: int) -> Tuple[int, int]:
    """
    Get the count of weekdays and weekend days in a month.

    Args:
        month: Month (0-11, where 0=January)
        year: Year (e.g., 2025)

    Returns:
        Tuple of (weekdays_count, weekends_count)
    """
    days_in_month = get_days_in_month(month, year)
    weekdays = 0
    weekends = 0

    for day in range(1, days_in_month + 1):
        if is_weekend(day, month, year):
            weekends += 1
        else:
            weekdays += 1

    return weekdays, weekends
