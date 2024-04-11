import json, asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from room.models import Room, RoomUser
from user.models import User
from django.db import transaction


class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_uuid = self.scope["url_route"]["kwargs"]["room_uuid"]
        self.room_group_name = "room_%s" % self.room_uuid

        self.user = self.scope["user"]
        if not await self.is_user_in_room(self.user, self.room_uuid):
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()



    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json.get("action")

        if action == "join":
            player_number = await self.assign_player_number()
            room_data = await self.send_room_data()
            existing_players = await self.get_existing_players_info()
            if existing_players == None:
                existing_players = 0
            self.player_number = player_number
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "room_message",
                    "message": {
                        "action": "player_joined",
                        "user_uuid": str(self.user.uuid),
                        "user_nickname": self.user.nickname,
                        "user_avatar": self.user.avatar,
                        "is_ready": False,
                        "player_number": player_number,
                        "players": existing_players,
                        "room_data": room_data,
                    },
                },
            )
        elif action == "ready":
            ready = text_data_json["is_ready"]
            player_number, is_ready = await self.set_ready_status(self.user, ready)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "room_message",
                    "message": {
                        "action": "ready",
                        "player_number": player_number,
                        "is_ready": is_ready,
                    },
                },
            )
        elif action == "start":
            success, message = await self.start_game()
            if success:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "room_message",
                        "message": {
                            "action": "start",
                            "message": message,
                            "status": "ok",
                        },
                    },
                )
            else:
                await self.send(text_data=json.dumps({"error": message}))

        elif action == "leave":
            is_owner = await self.is_room_owner(self.user, self.room_uuid)
            
            if is_owner:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "room_message",
                        "message": {
                            "action": "terminate",
                            "room_uuid": str(self.room_uuid),
                            "is_owner": is_owner
                        },
                    },
                )
                
                await self.delete_room_and_room_users(self.room_uuid)
            else:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "room_message",
                        "message": {
                            "action": "player_left",
                            "user_uuid": str(self.user.uuid),
                            "player_number": self.player_number,
                        },
                    },
                )
                
                await self.remove_user_from_room(self.user, self.room_uuid)

        elif action == "init":
            await self.send(text_data=json.dumps({"type":"init", "player_number": self.player_number}))

        elif action == "key_press":
            await self.handle_key_press(text_data_json["event"], text_data_json["key"], text_data_json["obj"])

        elif action == "win":
            await self.handle_win(text_data_json["msg"])

        elif action == "scored":
            print("scored")
            print(text_data_json)
            await self.handle_scored(text_data_json["msg"])

        elif action == "sync":
            await self.handle_sync(text_data_json["obj"])

    async def handle_sync(self, obj):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "sync",
                "obj": obj,
            },
        )

    async def sync(self, obj):
        await self.send(
            text_data=json.dumps(obj)
        )

    async def handle_win(self, msg):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "win",
                "msg": msg,
            },
        )

    async def win(self, msg):
        msg["player_number"] = self.player_number
        await self.send(
            text_data=json.dumps(msg)
        )
    
    async def handle_scored(self, msg):
        print("handle")
        print(msg)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "scored",
                "msg": msg,
            },
        )

    async def scored(self, msg):
        print("send")
        msg["player_number"] = self.player_number
        await self.send(
            text_data=json.dumps(msg)
        )

    async def room_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))

    async def handle_key_press(self, event, key, obj):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "player_key_press",
                "player_number": self.player_number,
                "event": event,
                "key": key,
                "obj": obj,
            },
        )

    async def player_key_press(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "key_press",
                    "player_number": event["player_number"],
                    "event": event["event"],
                    "key": event["key"],
                    "obj": event["obj"],
                }
            )
        )

    async def disconnect(self, close_code):
        is_owner = await self.is_room_owner(self.user, self.room_uuid)
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        
        if is_owner:
            await self.delete_room_and_room_users(self.room_uuid)
        else:
            await self.remove_user_from_room(self.user, self.room_uuid)

    @database_sync_to_async
    def is_user_in_room(self, user, room_uuid):
        return RoomUser.objects.filter(
            user_uuid_id=user.uuid, room_uuid=room_uuid
        ).exists()

    @database_sync_to_async
    def is_room_owner(self, user, room_uuid):
        room = Room.objects.get(uuid=room_uuid)
        return room.owner_uuid.uuid == user.uuid

    @database_sync_to_async
    def set_ready_status(self, user, ready):
        try:
            room_user = RoomUser.objects.get(
                user_uuid=user.uuid, room_uuid=self.room_uuid
            )
            room_user.is_ready = ready
            room_user.save(update_fields=["is_ready"])
            return room_user.player_number, room_user.is_ready
        except RoomUser.DoesNotExist:
            return None, None
        except Exception as e:
            print(e)
            return None, None

    @database_sync_to_async
    def assign_player_number(self):
        with transaction.atomic():
            room = Room.objects.select_for_update().get(uuid=self.room_uuid)

            try:
                room_user = RoomUser.objects.get(
                    room_uuid=room,
                    user_uuid=self.user
                )
                if room_user.player_number == None:
                    occupied_numbers = (
                        RoomUser.objects.filter(room_uuid=room)
                        .exclude(player_number__isnull=True)
                        .values_list("player_number", flat=True)
                        .order_by("player_number")
                    )

                    player_number = 1
                    for occupied_number in occupied_numbers:
                        if player_number < occupied_number:
                            break
                        player_number += 1

                    room_user.player_number = player_number
                    room_user.save(update_fields=["player_number"])
                    return player_number
                else:
                    return room_user.player_number
            except RoomUser.DoesNotExist:
                pass

    @database_sync_to_async
    def remove_user_from_room(self, user, room_uuid):
        room_user = RoomUser.objects.filter(
            user_uuid=user.uuid, room_uuid=room_uuid
        ).first()
        if room_user:
            room_user.delete()

    @database_sync_to_async
    def delete_room_and_room_users(self, room_uuid):
        Room.objects.filter(uuid=room_uuid).delete()

    @database_sync_to_async
    def start_game(self):
        try:
            room = Room.objects.get(uuid=self.room_uuid)
            player_count = room.room_users.count()

            if room.owner_uuid.uuid != self.user.uuid:
                return False, "방장 플레이어만 게임을 시작할 수 있습니다."
            
            if room.type == 1 and player_count != 2:
                return False, "2명의 플레이어가 필요합니다."
            elif (room.type == 2 or room.type == 3) and player_count != 4:
                return False, "4명의 플레이어가 필요합니다."

            if not all(room_user.is_ready for room_user in room.room_users.all()):
                return False, "모든 플레이어가 준비상태여야 합니다."

            room.is_active = True
            room.save()

            player_numbers = list(
                room.room_users.values_list("user_uuid", "player_number")
            )
            return True, "시작합니다"
        except Room.DoesNotExist:
            return False, "방을 찾을 수 없습니다."

    @database_sync_to_async
    def get_existing_players_info(self):
        room = Room.objects.get(uuid=self.room_uuid)
        
        room_users = room.room_users.all().select_related('user_uuid')
        players_info = [
            {
                'user_uuid': str(room_user.user_uuid.uuid),
                'user_nickname': room_user.user_uuid.nickname,
                'is_ready': room_user.is_ready,
                'user_avatar': room_user.user_uuid.avatar,
                'player_number': room_user.player_number,
            }
            for room_user in room_users
        ]
        
        return players_info
    
    @database_sync_to_async
    def send_room_data(self):
        room = Room.objects.get(uuid=self.room_uuid)

        room_data = [
            {
                "room_name": room.name,
                "room_type": room.type,
                "room_difficulty": room.difficulty,
            }
        ]

        return room_data