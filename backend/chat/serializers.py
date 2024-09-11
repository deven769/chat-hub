# chat/serializers.py

from rest_framework import serializers
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source="user.username")

    class Meta:
        model = Message
        fields = ["id", "user", "content", "timestamp"]
