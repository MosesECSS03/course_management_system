from django.urls import path
from . import views

urlpatterns = [
    path('courses/', views.product_list, name='product_list'),
    path('dashboard/', views.product_stock_dashboard, name='all_product_list'),
    path('dashboard_react/', views.product_stock_dashboard_react, name='all_product_list_react'),
    path('database/', views.sales_report_view, name='working_with_database')
]