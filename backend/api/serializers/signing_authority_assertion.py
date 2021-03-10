from rest_framework import serializers

from api.models.signing_authority_assertion import SigningAuthorityAssertion


class SigningAuthorityAssertionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SigningAuthorityAssertion
        fields = (
            'id', 'description', 'effective_date', 'expiration_date', 'module',
            'display_order'
        )
