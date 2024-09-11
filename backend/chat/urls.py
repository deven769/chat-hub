# chat/urls.py

from django.urls import path
from .views import MessageListCreateView, MessageSearchView

urlpatterns = [
    path("messages/", MessageListCreateView.as_view(), name="message-list-create"),
    path("messages/search/", MessageSearchView.as_view(), name="message-search"),
]
