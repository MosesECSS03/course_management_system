import requests
from django.conf import settings
import re

class WooCommerceAPI:
    def __init__(self):
        self.base_url = settings.WOOCOMMERCE_API_URL
        self.auth = (settings.WOOCOMMERCE_CONSUMER_KEY, settings.WOOCOMMERCE_CONSUMER_SECRET)

    def get_nsa_products(self):
        all_products = []
        page = 1
        per_page = 100  # Maximum number of products per page for WooCommerce API

        while True:
            try:
                # Construct the API URL with pagination
                url = f"{self.base_url}products"
                params = {
                    'per_page': per_page,
                    'page': page
                }        
                # Make the API request
                response = requests.get(url, params=params, auth=self.auth)
                response.raise_for_status()  # Check for request errors

                # Parse the response as JSON
                products = response.json()
                if not products:
                    break  # Exit the loop if no products are returned
                # Filter products based on the criteria
                filtered_products = [
                    product for product in products
                    if product.get('status') == 'publish'
                    and 'categories' in product
                    and len(product['categories']) == 2
                    and product['categories'][1].get('name') == 'Tri-Love Elderly: NSA'
                ]
                # Add filtered products to the list
                all_products.extend(filtered_products)
                # Increment page to fetch next set of products
                page += 1
            except requests.exceptions.RequestException as e:
                # Handle any errors during the request
                print(f"Error while fetching products: {e}")
                break
        return all_products

    def get_ilp_products(self):
        """Fetch and filter ILP products from WooCommerce."""
        all_products = []
        page = 1
        per_page = 100  # Maximum number of products per page for WooCommerce API

        while True:
            try:
                # Construct the API URL with pagination
                url = f"{self.base_url}products"
                params = {
                    'per_page': per_page,
                    'page': page
                }
                
                # Make the API request
                response = requests.get(url, params=params, auth=self.auth)
                response.raise_for_status()  # Check for request errors

                # Parse the response as JSON
                products = response.json()

                if not products:
                    break  # Exit the loop if no products are returned

                # Filter products based on the criteria for ILP
                filtered_products = [
                    product for product in products
                    if product.get('status') == 'publish'
                    and 'categories' in product
                    and len(product['categories']) == 2
                    and product['categories'][1].get('name') == 'Tri-Love Elderly: ILP'
                ]

                # Add filtered products to the list
                all_products.extend(filtered_products)

                # Increment page to fetch next set of products
                page += 1

            except requests.exceptions.RequestException as e:
                # Handle any errors during the request
                print(f"Error while fetching products: {e}")
                break

        return all_products

    def getProductId(self, product_name):
        """Fetches the product ID for a given product name from WooCommerce."""
        try:
            print(product_name)
            page = 1
            product_id = None
            per_page = 100

            while True:
                # Fetch products for the current page
                url = f"{self.base_url}products"
                params = {
                    'per_page': per_page,
                    'page': page,
                }

                 # Debugging: Print the URL and parameters to ensure correct request
                print(f"Requesting URL: {url}")
                print(f"Params: {params}")
                
                response = requests.get(url, params=params, auth=self.auth)
                response.raise_for_status()  # Ensure we raise an error for bad requests

                products = response.json()  # Get products from the response
                print("Selected:", products)

                # If no products are returned, break the loop
                if not products:
                    break

                # Check each product for a match
                for product in products:
                    if product['name'] == product_name:
                        product_id = product['id']
                        break  # Exit the loop if the product is found

                page += 1  # Move to the next page

            # Return the product ID if found, otherwise None
            return {"productId": product_id, "exists": True}

        except requests.exceptions.RequestException as e:
            # Handle any errors during the request
            print(f"Error fetching product ID: {e}")
            return None

    def updateCourseQuantity(request, product_id, status):
        """
        Updates the product stock based on the product ID and the status.
        Arguments:
            - product_id: The ID of the product to update.
            - status: The status to update stock based on ("Cancelled", "Paid").
        """
        try:
            # Construct the WooCommerce API URL to fetch product details
            url = f"{settings.WOOCOMMERCE_API_URL}products/{product_id}"
            auth = (settings.WOOCOMMERCE_CONSUMER_KEY, settings.WOOCOMMERCE_CONSUMER_SECRET)
            
            # Fetch current product details
            response = requests.get(url, auth=auth)
            response.raise_for_status()  # Raises an HTTPError if the response was an error
            
            product = response.json()
            print("Update Product Stocks:", status)

            # Check the current stock quantity
            new_stock_quantity = product['stock_quantity']

            # Parse short description to find "vacancy"
            short_description = product.get('short_description', '')
            array = short_description.split("<p>")
            
            if array[0] == '':
                array.pop(0)  # Remove the empty string at the start

            # Extract the vacancy information
            vacancies = next(
                (item.replace("\n", "").replace("<b>", "").replace("</b>", "") for item in array if "vacancy" in item.lower()),
                ""
            ).split("<br />")[-1].strip().split("/")[2]
            
            # Match and extract the number of vacancies
            vacancies_match = re.search(r'\d+', vacancies)
            vacancies_match = int(vacancies_match.group(0)) if vacancies_match else 0

            print("Current:", product['stock_quantity'])
            print(f"Status is {status}")

            if vacancies_match < new_stock_quantity:
                new_stock_quantity = vacancies_match  # Decrease stock to match vacancy if needed
            elif vacancies_match >= new_stock_quantity and new_stock_quantity > 0:
                if status == "Cancelled":
                    new_stock_quantity += 1  # Increase stock by 1 if cancelled
                elif status == "Paid":
                    print("Decrease")
                    new_stock_quantity -= 1  # Decrease stock by 1 if paid
            elif new_stock_quantity <= 0:
                new_stock_quantity = 0

            # Prepare data for updating the product stock
            update_data = {
                "stock_quantity": new_stock_quantity
            }

            # Update the product stock via API
            update_response = requests.put(f"{settings.WOOCOMMERCE_API_URL}products/{product_id}", 
                                        json=update_data, auth=auth)
            update_response.raise_for_status()  # Check if the update was successful

            return True
        except requests.exceptions.RequestException as e:
            print(f"Error updating product stock: {e}")
            return False
