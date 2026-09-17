from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
import re

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'mobile_number', 'date_joined')
        read_only_fields = ('id', 'date_joined')

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'mobile_number', 'password', 'confirm_password')

    def validate_email(self, value):
        return value.lower()

    def validate_mobile_number(self, value):
        # Allow +91 and 10 digits, or just 10 digits
        cleaned = re.sub(r'\D', '', value)
        if len(cleaned) == 12 and cleaned.startswith('91'):
            cleaned = cleaned[2:]
        if len(cleaned) != 10:
            raise serializers.ValidationError("Invalid Indian mobile number format.")
        return cleaned

    def validate_username(self, value):
        if not re.match(r'^[\w.@+-]+$', value):
            raise serializers.ValidationError("Enter a valid username. This value may contain only letters, numbers, and @/./+/-/_ characters.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            mobile_number=validated_data['mobile_number'],
            password=validated_data['password']
        )
        return user
