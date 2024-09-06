import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from .models import Message

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = "chat_room"
        self.room_group_name = f"chat_{self.room_name}"

        # Get the token from the URL parameters
        token = self.scope["query_string"].decode().split("=")[1]

        # Authenticate the user
        user = await self.get_user_from_token(token)
        if user is None or isinstance(user, AnonymousUser):
            # Reject the connection if the user is not authenticated
            await self.close()
            return

        self.scope["user"] = user

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_content = text_data_json["message"]
        user = self.scope["user"]

        # Save the message to the database
        timestamp = await self.save_message(user, message_content)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message_content,
                "user": user.username,
                "timestamp": timestamp.isoformat(),
            },
        )

    async def chat_message(self, event):
        message = event["message"]
        user = event["user"]
        timestamp = event["timestamp"]

        # Send message to WebSocket
        await self.send(
            text_data=json.dumps(
                {"message": message, "user": user, "timestamp": timestamp}
            )
        )

    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            access_token = AccessToken(token)
            user = User.objects.get(id=access_token["user_id"])
            return user
        except Exception as e:
            print(f"Error authenticating token: {e}")
            return None

    @database_sync_to_async
    def save_message(self, user, message_content):
        # Save the message to the existing Message model
        message = Message.objects.create(user=user, content=message_content)
        return message.timestamp
