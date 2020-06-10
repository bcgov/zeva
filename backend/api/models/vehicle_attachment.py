"""
    REST API Documentation for the NRS TFRS Credit Trading Application

    The Transportation Fuels Reporting System is being designed to streamline
    compliance reporting for transportation fuel suppliers in accordance with
    the Renewable & Low Carbon Fuel Requirements Regulation.

    OpenAPI spec version: v1


    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
"""
from django.db import models
from auditable.models import Auditable


class VehicleAttachment(Auditable):
    """
    Attachment information for the vehicles.
    """
    vehicle = models.ForeignKey(
        'Vehicle',
        null=False,
        related_name='vehicle_attachments',
        on_delete=models.PROTECT
    )
    filename = models.CharField(
        max_length=260,
        db_comment="Filename from when it was in the user's system."
    )
    minio_object_name = models.CharField(
        blank=False,
        max_length=32,
        null=False,
        db_comment="Object name in minio (UUID as a 32 hexadecimal string)."
    )
    size = models.BigIntegerField(
        default=0,
        null=False,
        db_comment="Size of the file in bytes."
    )
    mime_type = models.CharField(
        blank=True,
        max_length=255,
        null=True,
        db_comment="Mime type information of the file. "
                   "(eg. application/pdf, image/gif, image/png, etc)"
    )
    is_removed = models.BooleanField(
        default=False,
        db_comment="Whether it was marked as deleted"
    )

    class Meta:
        db_table = 'vehicle_file_attachment'

    db_table_comment = "Attachment information for the vehicles." \
                       "Contains information such as mime type, file size, " \
                       "and minio URL."
