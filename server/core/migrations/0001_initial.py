# Generated by Django 5.0.3 on 2024-03-19 07:52

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('user', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='OneVsOneHistory',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('play_time', models.DateTimeField()),
                ('win_user', models.CharField(max_length=255)),
                ('user1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='one_vs_one_histories_user1', to='user.user')),
                ('user2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='one_vs_one_histories_user2', to='user.user')),
            ],
        ),
        migrations.CreateModel(
            name='Room',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('type', models.IntegerField()),
                ('difficulty', models.IntegerField()),
                ('owner_uuid', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='owned_rooms', to='user.user')),
            ],
        ),
        migrations.CreateModel(
            name='RoomUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('room_uuid', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='room_users', to='core.room')),
                ('user_uuid', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='room_users', to='user.user')),
            ],
        ),
        migrations.CreateModel(
            name='TournamentHistory',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('play_time', models.DateTimeField()),
                ('win_user', models.CharField(max_length=255)),
                ('user1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tournament_histories_user1', to='user.user')),
                ('user2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tournament_histories_user2', to='user.user')),
                ('user3', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tournament_histories_user3', to='user.user')),
                ('user4', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tournament_histories_user4', to='user.user')),
            ],
        ),
        migrations.CreateModel(
            name='WinLoseHistory',
            fields=[
                ('auto_increment', models.AutoField(primary_key=True, serialize=False)),
                ('game_count', models.IntegerField(default=0)),
                ('victory_count', models.IntegerField(default=0)),
                ('defeat_count', models.IntegerField(default=0)),
                ('user_uuid', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='win_lose_histories', to='user.user')),
            ],
        ),
    ]
