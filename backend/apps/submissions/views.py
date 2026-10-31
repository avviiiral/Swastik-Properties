from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle

from .serializers import PropertyEnquirySerializer


class PropertyEnquiryThrottle(AnonRateThrottle):
    rate = "5/hour"


class PropertyEnquiryCreateView(generics.CreateAPIView):
    serializer_class = PropertyEnquirySerializer
    permission_classes = (AllowAny,)
    throttle_classes = (PropertyEnquiryThrottle,)
