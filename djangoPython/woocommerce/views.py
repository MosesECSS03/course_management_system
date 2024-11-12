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
    

#def get_filtered_data(request):
 #   if request.method == 'POST':
  #      data = json.loads(request.body)
   #     category = data.get('category')
    #    values = data.get('values')

        # Create a DataFrame
#        df = pd.DataFrame({
 #           "Category": category,
  #          "Values": values
   #     })

        # Create a Plotly bar chart
    #    fig = px.bar(df, x="Category", y="Values", title="Filtered Bar Chart")

        # Convert the chart to HTML
     #   graph_html = fig.to_html(full_html=False)

        # Return the HTML directly as the response
      #  return HttpResponse(graph_html)

    #return HttpResponse('Invalid request method. Please use POST.', status=400)

from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
import plotly.express as px
import pandas as pd
import json

@csrf_exempt
def get_filtered_data(request):
            # Parse JSON data from request body
            #data = json.loads(request.body)
            #category = data.get('category', [])  # Make sure 'category' is fetched
            #values = data.get('values', [])
            #print("Values:", values)
            #print("Category:", category)

            # Generate the Plotly graph
            df = pd.DataFrame({
                "Name": ['TCM Diet & Therapy', 'Nagomi Pastel Art Appreciation', 'Nagomi Pastel Art Appreciation', 'Nagomi Pastel Art Basic', 'Therapeutic Watercolour Painting for Beginners', 'Therapeutic Watercolour Painting for Beginners', 'Chinese Calligraphy Intermediate', 'Therapeutic Basic Line Work', 'Chinese Calligraphy Basic', 'Chinese Calligraphy Basic', 'Community Ukulele - Mandarin', 'Community Ukulele - Mandarin', 'Community Singing - Mandarin', 'Community Singing - Mandarin', 'The Rest Note of Life - Mandarin', 'Self-Care TCM Wellness - Mandarin', 'Self-Care TCM Wellness - Mandarin', 'Fun with Paper Quilling', 'Smart Design - 3D Printing & Modelling', 'Little India Heritage Trail', 'Fun with Paper Quilling', 'Smart Pay - Cashless Convenience'],  # Use the 'category' from the request data
                "Vacancy": [25, 8, 9, 15, 9, 15, 12, 15, 12, 12, 20, 20, 20, 20, 1, 17, 13, 19, 20, 20, 19, 20]
            })
            fig = px.bar(df, x="Name", y="Vacancy", title="Filtered Bar Chart")

            fig.update_layout(xaxis_title='Courses', yaxis_title='Vacancies')

            # Convert the chart to HTML (only the graph, no full HTML)
            graph_html = fig.to_html(full_html=False)

            # Render the template with the graph HTML embedded
            #return render(request, 'woocommerce/dashboard.html', {'graph_html': graph_html})x

            # Return the HTML directly as the response
            return HttpResponse(graph_html)