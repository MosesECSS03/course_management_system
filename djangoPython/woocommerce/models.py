from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=255)
    stock_quantity = models.IntegerField()