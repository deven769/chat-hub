# chat/views.py

from rest_framework import generics
from .models import Message
from .serializers import MessageSerializer
from rest_framework.permissions import IsAuthenticated


class MessageListCreateView(generics.ListCreateAPIView):
    queryset = Message.objects.all().order_by("timestamp")
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]


class MessageSearchView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get("q")
        return Message.objects.filter(content__icontains=query).order_by("timestamp")
