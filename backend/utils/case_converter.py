"""
Utility functions for converting snake_case to camelCase in API responses
"""

def to_camel_case(snake_str: str) -> str:
    """Convert snake_case string to camelCase"""
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])


def convert_dict_to_camel(data: dict) -> dict:
    """
    Recursively convert all keys in a dictionary from snake_case to camelCase
    
    Args:
        data: Dictionary with snake_case keys
        
    Returns:
        Dictionary with camelCase keys
    """
    if not isinstance(data, dict):
        return data
        
    camel_dict = {}
    for key, value in data.items():
        # Convert key to camelCase
        camel_key = to_camel_case(key)
        
        # Recursively convert nested dicts and lists
        if isinstance(value, dict):
            camel_dict[camel_key] = convert_dict_to_camel(value)
        elif isinstance(value, list):
            camel_dict[camel_key] = [
                convert_dict_to_camel(item) if isinstance(item, dict) else item
                for item in value
            ]
        else:
            camel_dict[camel_key] = value
            
    return camel_dict


def convert_model_to_camel(model_instance) -> dict:
    """
    Convert SQLAlchemy model instance to camelCase dict
    
    Args:
        model_instance: SQLAlchemy model instance
        
    Returns:
        Dictionary with camelCase keys
    """
    if hasattr(model_instance, '__dict__'):
        # Get model attributes, excluding SQLAlchemy internal attributes
        data = {
            key: value
            for key, value in model_instance.__dict__.items()
            if not key.startswith('_')
        }
        return convert_dict_to_camel(data)
    return model_instance
