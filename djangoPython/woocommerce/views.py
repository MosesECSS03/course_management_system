from django.http import JsonResponse, HttpResponse
from .services import WooCommerceAPI
from django.views.decorators.csrf import csrf_exempt  # Temporarily disable CSRF validation for this view
import json
import plotly.express as px
import pandas as pd
from django.shortcuts import render

@csrf_exempt  # Temporarily disable CSRF validation for this view
def product_list(request):
    """Fetches and returns a list of products from WooCommerce based on the courseType."""
    data = json.loads(request.body)
    courseType = data.get('courseType')  # Get the courseType from the request body

    woo_api = WooCommerceAPI()  # Create an instance of WooCommerceAPI

    if courseType == "NSA": 
        products = woo_api.get_nsa_products()  # Call the method on the instance
    elif courseType == "ILP":
        products = woo_api.get_ilp_products()  # Call the method on the instance
    else:
        products = woo_api.get_nsa_products()+woo_api.get_ilp_products() # Handle other course types if needed
    
    # Convert the response data to a JSON string and return it
    response_data = json.dumps(products)
    return JsonResponse({"courses": response_data})

import re
import json
from django.shortcuts import render
from django.http import JsonResponse

@csrf_exempt 
def product_stock_dashboard(request):
    try:
        # Fetch products from WooCommerce API
        woo_api = WooCommerceAPI()
        products = woo_api.get_nsa_products() + woo_api.get_ilp_products()  # Adjust as needed

        # Extract product names and stock quantities with custom logic for name splitting
        product_data = []
        for product in products:
            # Split the product name by <br/> or <br />
            split_name = re.split(r'<br\s*/?>', product['name'])

            # Determine how to process the name based on the split length
            if len(split_name) == 3:
                processed_name = f"{split_name[1]} {split_name[2][1:-1]}"  # Correct slicing syntax
            elif len(split_name) == 2:
                processed_name = f"{split_name[0]} {split_name[1][1:-1]}"  # Correct slicing syntax
            else:
                processed_name = " ".join(split_name)  # Join all parts in case of an unexpected length

            
            # Append processed product data
            product_data.append({
                'name': processed_name,
                'stock': product['stock_quantity']
            })

        # Calculate insights
        most_stocked_product = max(product_data, key=lambda x: x['stock'])['name']
        least_stocked_product = min(product_data, key=lambda x: x['stock'])['name']

        # Pass data to template
        context = {
            'product_data': json.dumps(product_data),  # Serialize product data to JSON string
            'most_stocked_product': most_stocked_product,
            'least_stocked_product': least_stocked_product,
        }

        return render(request, 'woocommerce/example.html', context)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

from django.http import JsonResponse
import json
import re

@csrf_exempt
def product_stock_dashboard_react(request):
    try:
        # Fetch products from WooCommerce API
        woo_api = WooCommerceAPI()
        products = woo_api.get_nsa_products() + woo_api.get_ilp_products()  # Adjust as needed

        # Extract product names and stock quantities with custom logic for name splitting
        product_data = []
        for product in products:
            # Split the product name by <br/> or <br />
            split_name = re.split(r'<br\s*/?>', product['name'])

            # Determine how to process the name based on the split length
            if len(split_name) == 3:
                processed_name = f"{split_name[1]} {split_name[2][1:-1]}"  # Correct slicing syntax
            elif len(split_name) == 2:
                processed_name = f"{split_name[0]} {split_name[1][1:-1]}"  # Correct slicing syntax
            else:
                processed_name = " ".join(split_name)  # Join all parts in case of an unexpected length

            # Append processed product data
            product_data.append({
                'name': processed_name,
                'stock': product['stock_quantity']
            })

        # Calculate insights
        most_stocked_product = max(product_data, key=lambda x: x['stock'])['name']
        least_stocked_product = min(product_data, key=lambda x: x['stock'])['name']

        # Return JSON response
        return JsonResponse({
            'product_data': product_data,  # Return the processed product data
            'most_stocked_product': most_stocked_product,
            'least_stocked_product': least_stocked_product,
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

'''Working with Database'''
from collections import defaultdict
from pymongo import MongoClient
from django.shortcuts import render

def sales_report_view(request):
    # MongoDB connection
    client = MongoClient("mongodb+srv://moseslee:Mlxy6695@ecss-course.hejib.mongodb.net/?retryWrites=true&w=majority&appName=ECSS-Course")
    db = client["Courses-Management-System"]
    collection = db["Registration Forms"]

    # Retrieve documents where courseType is 'NSA' and status is not 'Cancelled'
    #documents = list(collection.find({"course.courseType": "NSA", "status": {"$ne": "Cancelled"}}))

    # Retrieve documents where courseType is 'NSA' and status is neither 'Cancelled' nor 'Pending'
    documents = list(collection.find({"course.courseType": "NSA", "status": "Paid"}))

    
    # Prepare an aggregation dictionary
    course_totals = defaultdict(lambda: defaultdict(float))  # Nested dictionary for totals by duration

    # Process each document
    for doc in documents:
        # Clean up and convert coursePrice to a float
        course_price = doc['course'].get('coursePrice', None)
        if course_price and isinstance(course_price, str) and course_price.startswith('$'):
            course_price = float(course_price.replace('$', '').strip())
        else:
            course_price = 0.0
        
        # Ensure fields are included
        course_duration = doc['course'].get('courseDuration', 'N/A')  # Default to 'N/A' if missing
        course_eng_name = doc['course'].get('courseEngName', 'N/A')  # Default to 'N/A' if missing

        # Add to aggregation
        course_totals[course_eng_name][course_duration] += course_price

        # Serialize MongoDB ObjectId to a string for JSON compatibility
        doc["_id"] = str(doc["_id"])

    # Convert the nested dictionary to a list of results for the template
    aggregated_data = [
        {"courseEngName": course_name, "durations": [{"courseDuration": duration, "totalPrice": total} for duration, total in durations.items()]}
        for course_name, durations in course_totals.items()
    ]

    # Pass both raw documents and aggregated data to the template
    return render(request, 'woocommerce/salesReport.html', {'documents': documents, 'aggregated_data': aggregated_data})
