from django.urls import path
from . import views

urlpatterns = [
    path('products/', views.product_list, name='product_list'),
    path('api/filter-data/', views.get_filtered_data, name='get_filtered_data'),
]