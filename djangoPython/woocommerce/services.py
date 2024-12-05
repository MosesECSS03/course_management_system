import requests
from django.conf import settings

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

    def get_product_id(self, product_name, per_page=100):
        """Fetches the product ID for a given product name from WooCommerce."""
        try:
            page = 1
            product_id = None

            while True:
                # Fetch products for the current page
                url = f"{self.base_url}products"
                params = {
                    'page': page,
                    'per_page': per_page,
                    'search': product_name  # Search filter by product name
                }
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

                if product_id:
                    break  # Exit the outer loop if the product is found

                if len(products) < per_page:
                    break  # Exit the loop if we've reached the last page

                page += 1  # Move to the next page

            # Return the product ID if found, otherwise None
            return product_id

        except requests.exceptions.RequestException as e:
            # Handle any errors during the request
            print(f"Error fetching product ID: {e}")
            return None