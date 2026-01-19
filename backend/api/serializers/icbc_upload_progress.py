from rest_framework import serializers
from api.models.icbc_upload_progress import IcbcUploadProgress


class IcbcUploadProgressSerializer(serializers.ModelSerializer):
    status = serializers.CharField(source='status_text', read_only=True)
    
    class Meta:
        model = IcbcUploadProgress
        fields = [
            'upload_id',
            'progress',
            'status',
            'current_page',
            'total_pages',
            'complete',
            'error',
            'results',
            'create_timestamp',
            'update_timestamp'
        ]
        read_only_fields = ['create_timestamp', 'update_timestamp']
