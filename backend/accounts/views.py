from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
from django.db.models import Q
from .serializers import SignupSerializer, UserSerializer

User = get_user_model()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }

def set_jwt_cookies(response, refresh_token):
    # Set the HttpOnly refresh token cookie
    response.set_cookie(
        key='refresh_token',
        value=refresh_token,
        httponly=True,
        secure=not settings.DEBUG,
        samesite='Lax'
    )

class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignupSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user).data
        
        response = Response({'user': user_data, 'access': tokens['access']}, status=status.HTTP_201_CREATED)
        set_jwt_cookies(response, tokens['refresh'])
        return response


class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        identifier = request.data.get('identifier')
        password = request.data.get('password')

        if not identifier or not password:
            return Response({'error': 'Please provide both identifier and password.'}, status=status.HTTP_400_BAD_REQUEST)

        # Allow login by email or mobile number
        user = User.objects.filter(Q(email__iexact=identifier) | Q(mobile_number=identifier)).first()

        if user and user.check_password(password):
            if not user.is_active:
                return Response({'error': 'This account is inactive.'}, status=status.HTTP_401_UNAUTHORIZED)
            
            tokens = get_tokens_for_user(user)
            user_data = UserSerializer(user).data
            
            response = Response({'user': user_data, 'access': tokens['access']}, status=status.HTTP_200_OK)
            set_jwt_cookies(response, tokens['refresh'])
            return response
        else:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            response = Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
            response.delete_cookie('refresh_token')
            return response
        except Exception as e:
            response = Response({"error": "Logout failed."}, status=status.HTTP_400_BAD_REQUEST)
            response.delete_cookie('refresh_token')
            return response


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return Response({"error": "Refresh token not found."}, status=status.HTTP_401_UNAUTHORIZED)

        # Mutate the request data to include the refresh token since the SimpleJWT view expects it there
        data = request.data.copy()
        data['refresh'] = refresh_token
        request._full_data = data

        try:
            response = super().post(request, *args, **kwargs)
            if response.status_code == 200:
                # Issue new refresh token if ROTATE_REFRESH_TOKENS is True
                new_refresh = response.data.get('refresh')
                if new_refresh:
                    set_jwt_cookies(response, new_refresh)
                    # We don't want to return the refresh token in the JSON body
                    del response.data['refresh']
            return response
        except TokenError as e:
            raise InvalidToken(e.args[0])

from .firebase_admin import verify_firebase_token

class GoogleLoginView(APIView):
    """
    Authenticates a user via a Firebase ID token generated from Google Sign-In.
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        id_token = request.data.get('id_token')
        
        if not id_token:
            return Response({'error': 'id_token is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            decoded_token = verify_firebase_token(id_token)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
            
        firebase_uid = decoded_token.get('uid')
        email = decoded_token.get('email')
        name = decoded_token.get('name', '')
        
        if not firebase_uid or not email:
            return Response({'error': 'Token does not contain required user information.'}, status=status.HTTP_401_UNAUTHORIZED)
            
        # 1. Try finding by firebase_uid
        user = User.objects.filter(firebase_uid=firebase_uid).first()
        
        # 2. Try finding by email
        if not user:
            user = User.objects.filter(email__iexact=email).first()
            if user:
                # Link existing user
                user.firebase_uid = firebase_uid
                user.save()
        
        # 3. Create new user if still not found
        if not user:
            # Generate a base username from name or email
            base_username = name.replace(' ', '').lower()
            if not base_username:
                base_username = email.split('@')[0]
                
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
                
            user = User.objects.create_user(
                email=email,
                username=username,
                mobile_number=None,
            )
            user.firebase_uid = firebase_uid
            user.set_unusable_password()
            user.save()
            
        # 4. Generate JWT tokens and response
        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user).data
        
        response = Response({'user': user_data, 'access': tokens['access']}, status=status.HTTP_200_OK)
        set_jwt_cookies(response, tokens['refresh'])
        return response
