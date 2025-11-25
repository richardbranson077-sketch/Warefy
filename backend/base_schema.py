"""
Base Pydantic configuration for automatic camelCase conversion
"""

from pydantic import BaseModel, ConfigDict


def to_camel(string: str) -> str:
    """Convert snake_case to camelCase"""
    components = string.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])


class CamelCaseModel(BaseModel):
    """
    Base model that automatically converts snake_case fields to camelCase in JSON output
    """
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,  # Allow both snake_case and camelCase input
        from_attributes=True  # Allow ORM mode
    )
