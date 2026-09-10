def validate_positive_integer(value: int, field_name: str = "value") -> int:
    if not isinstance(value, int) or value <= 0:
        raise ValueError(f"{field_name} must be a positive integer")
    return value

def validate_required_text(value: str, field_name: str = "value") -> str:
    cleaned = value.strip() if isinstance(value, str) else ""
    if not cleaned:
        raise ValueError(f"{field_name} is required")
    return cleaned
