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
    return JsonResponse({"product": response_data})

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
