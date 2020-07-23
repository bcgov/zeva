from rest_framework.serializers import ModelSerializer

from api.models.icbc_upload_date import IcbcUploadDate


class IcbcUploadDateSerializer(ModelSerializer):
    class Meta:
        model = IcbcUploadDate
        fields = ('upload_date',)