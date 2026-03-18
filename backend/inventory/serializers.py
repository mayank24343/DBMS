from rest_framework import serializers
from .models import Inventory, Item

class InventoryAlertSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_type = serializers.CharField(source='item.type', read_only=True)
    # Adding a helper field to show how much is missing
    shortfall = serializers.SerializerMethodField()

    class Meta:
        model = Inventory
        fields = ['id', 'item_name', 'item_type', 'quantity', 'threshold', 'shortfall', 'expiry']

    def get_shortfall(self, obj):
        if obj.quantity < obj.threshold:
            return obj.threshold - obj.quantity
        return 0