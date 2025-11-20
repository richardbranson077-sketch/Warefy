"""
Route optimization using Google OR-Tools for Vehicle Routing Problem (VRP).
"""

from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import numpy as np
from typing import List, Dict, Any, Tuple
import math

def calculate_distance(point1: Tuple[float, float], point2: Tuple[float, float]) -> float:
    """
    Calculate Haversine distance between two GPS coordinates.
    
    Args:
        point1: (latitude, longitude) tuple
        point2: (latitude, longitude) tuple
    
    Returns:
        Distance in kilometers
    """
    lat1, lon1 = point1
    lat2, lon2 = point2
    
    R = 6371  # Earth's radius in kilometers
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    
    c = 2 * math.asin(math.sqrt(a))
    distance = R * c
    
    return distance

def create_distance_matrix(locations: List[Tuple[float, float]]) -> List[List[int]]:
    """
    Create distance matrix from list of GPS coordinates.
    
    Args:
        locations: List of (latitude, longitude) tuples
    
    Returns:
        Distance matrix in meters (as integers for OR-Tools)
    """
    n = len(locations)
    distance_matrix = [[0] * n for _ in range(n)]
    
    for i in range(n):
        for j in range(n):
            if i != j:
                dist_km = calculate_distance(locations[i], locations[j])
                distance_matrix[i][j] = int(dist_km * 1000)  # Convert to meters
    
    return distance_matrix

def optimize_route_ortools(
    start_location: Dict[str, float],
    delivery_points: List[Dict[str, Any]],
    num_vehicles: int = 1
) -> Dict[str, Any]:
    """
    Optimize delivery route using Google OR-Tools.
    
    Args:
        start_location: Starting point with 'lat' and 'lon' keys
        delivery_points: List of delivery points with 'lat', 'lon', and optional 'priority'
        num_vehicles: Number of vehicles to use
    
    Returns:
        Optimized route with sequence, distance, and duration
    """
    # Prepare locations (start + delivery points)
    locations = [(start_location['lat'], start_location['lon'])]
    for point in delivery_points:
        locations.append((point['lat'], point['lon']))
    
    # Create distance matrix
    distance_matrix = create_distance_matrix(locations)
    
    # Create routing index manager
    manager = pywrapcp.RoutingIndexManager(
        len(distance_matrix),
        num_vehicles,
        0  # Depot index (start location)
    )
    
    # Create routing model
    routing = pywrapcp.RoutingModel(manager)
    
    # Create distance callback
    def distance_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return distance_matrix[from_node][to_node]
    
    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
    
    # Add distance dimension
    dimension_name = 'Distance'
    routing.AddDimension(
        transit_callback_index,
        0,  # No slack
        300000,  # Maximum distance per vehicle (300 km)
        True,  # Start cumul to zero
        dimension_name
    )
    
    distance_dimension = routing.GetDimensionOrDie(dimension_name)
    distance_dimension.SetGlobalSpanCostCoefficient(100)
    
    # Set search parameters
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    search_parameters.time_limit.seconds = 5
    
    # Solve
    solution = routing.SolveWithParameters(search_parameters)
    
    if solution:
        # Extract solution
        route_sequence = []
        total_distance = 0
        
        for vehicle_id in range(num_vehicles):
            index = routing.Start(vehicle_id)
            
            while not routing.IsEnd(index):
                node_index = manager.IndexToNode(index)
                if node_index > 0:  # Skip depot
                    route_sequence.append(node_index - 1)  # Adjust for delivery point index
                
                previous_index = index
                index = solution.Value(routing.NextVar(index))
                total_distance += routing.GetArcCostForVehicle(previous_index, index, vehicle_id)
        
        # Calculate estimated duration (assuming 50 km/h average speed)
        estimated_duration_hours = (total_distance / 1000) / 50
        estimated_duration_minutes = estimated_duration_hours * 60
        
        # Create route geometry
        route_geometry = [start_location]
        for idx in route_sequence:
            point = delivery_points[idx]
            route_geometry.append({"lat": point['lat'], "lon": point['lon']})
        route_geometry.append(start_location)  # Return to start
        
        return {
            "optimized_sequence": route_sequence,
            "total_distance": round(total_distance / 1000, 2),  # Convert to km
            "estimated_duration": round(estimated_duration_minutes, 2),
            "route_geometry": route_geometry,
            "num_vehicles": num_vehicles
        }
    else:
        raise Exception("No solution found for route optimization")

def optimize_multi_vehicle_routes(
    depot_location: Dict[str, float],
    delivery_points: List[Dict[str, Any]],
    vehicles: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Optimize routes for multiple vehicles.
    
    Args:
        depot_location: Starting depot with 'lat' and 'lon'
        delivery_points: List of delivery points
        vehicles: List of vehicle information
    
    Returns:
        List of optimized routes, one per vehicle
    """
    num_vehicles = len(vehicles)
    
    result = optimize_route_ortools(depot_location, delivery_points, num_vehicles)
    
    # Split route among vehicles (simplified)
    routes = []
    points_per_vehicle = len(result['optimized_sequence']) // num_vehicles
    
    for i, vehicle in enumerate(vehicles):
        start_idx = i * points_per_vehicle
        end_idx = start_idx + points_per_vehicle if i < num_vehicles - 1 else len(result['optimized_sequence'])
        
        vehicle_sequence = result['optimized_sequence'][start_idx:end_idx]
        
        routes.append({
            "vehicle_id": vehicle['id'],
            "sequence": vehicle_sequence,
            "delivery_count": len(vehicle_sequence)
        })
    
    return routes
