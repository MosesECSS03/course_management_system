from django.http import JsonResponse
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
        products = []  # Handle other course types if needed
    
    # Convert the response data to a JSON string and return it
    response_data = json.dumps(products)
    return JsonResponse({"product": response_data})

@csrf_exempt 
def get_filtered_data(request):
    # Get category filter from the GET request (defaults to None if not provided)
    category_filter = request.GET.get('category', None)
    
    # Example data (replace with your actual data)
    data = pd.DataFrame({
        "Category": ['A', 'B', 'C', 'D'],
        "Values": [10, 15, 13, 18]
    })
    
    # If a category filter is provided, filter the data
    if category_filter:
        data = data[data['Category'] == category_filter]
    
    # Create a Plotly figure
    fig = px.bar(data, x='Category', y='Values', title='Filtered Bar Chart')
    graph_html = fig.to_html(full_html=False)

    # Render the template and pass the graph HTML
    return render(request, 'woocommerce/dashboard.html', {'graph_html': graph_html})