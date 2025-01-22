from django.core.management import BaseCommand
from django.db import connection
from django.db import transaction
from api.models.user_profile import UserProfile
from api.models.organization import Organization

class Command(BaseCommand):
    help = "Reset the database to an almost empty state " \
        "while leaving behind essential data such as some organizations, users, and login information."
    
    """
    # Permanent Data Tables (not to be reset):
    address_typeauth_group
    auth_*
    compliance_ratio
    credit_class_code
    credit_transaction_type
    django_*
    fixture_migrations
    model_year
    notification
    signing_authority_assertion
    permission
    role
    role_permission
    vehicle_class_code
    vehicle_zev_type
    weight_class_code

    # Optional Tables (may be partially reset depending on the options):
    organization
    organization_address
    user_profile
    user_role
    """

    tables_to_be_reset = [
        # credit_agreement tables
        "credit_agreement_comment",
        "credit_agreement_content",
        "credit_agreement_credit_transaction",
        "credit_agreement_file_attachment",
        "credit_agreement_history",
        "credit_agreement",

        # credit_transfer tables
        "credit_transfer_comment",
        "credit_transfer_content",
        "credit_transfer_credit_transaction",
        "credit_transfer_history",
        "credit_transfer",

        # icbc tables
        "icbc_registration_data",
        "icbc_snapshot_data",
        "icbc_upload_date",
        "icbc_vehicle",

        # model_year_report tables
        "model_year_report_address",
        "model_year_report_adjustment",
        "model_year_report_assessment",
        "model_year_report_assessment_comment",
        "model_year_report_assessment_descriptions",
        "model_year_report_compliance_obligation",
        "model_year_report_confirmation",
        "model_year_report_credit_offset",
        "model_year_report_credit_transaction",
        "model_year_report_history",
        "model_year_report_ldv_sales",
        "model_year_report_make",
        "model_year_report_vehicle",
        "model_year_report",

        # organization tables
        "organization_deficits",
        "organization_ldv_sales",

        # sales_forecast tables
        "sales_forecast_record",
        "sales_forecast",

        # sales_submission tables
        "sales_submission_comment",
        "sales_submission_content",
        "sales_submission_content_reason",
        "sales_submission_credit_transaction",
        "sales_submission_evidence",
        "sales_submission_history",
        "sales_submission",

        # supplemental_report tables
        "supplemental_report_assessment",
        "supplemental_report_assessment_comment",
        "supplemental_report_comment",
        "supplemental_report_credit_activity",
        "supplemental_report_file_attachment",
        "supplemental_report_history",
        "supplemental_report_sales",
        "supplemental_report_supplier_information",
        "supplemental_report",

        # vehicle tables
        "vehicle_change_history",
        "vehicle_comment",
        "vehicle_file_attachment",
        "vehicle",

        # other tables
        "credit_transaction",
        "notification_subscription",
        "record_of_sale",
        "signing_authority_confirmation",
        "user_creation_request",
    ]

    def add_arguments(self, parser):
        parser.add_argument(
            "--inactive-users",
            action = "store_true",
            help = "also remove all inactive user profiles."
        )
        parser.add_argument(
            "--orgs-without-users",
            action = "store_true",
            help = "also remove all organizations without any associated users. "
                "When used with --inactive-users, the inactive users will be removed first."
        )
        parser.add_argument(
            "--users-without-orgs",
            action = "store_true",
            help = "also remove all user profiles without an organization."
        )
        parser.add_argument(
            "--non-gov",
            action = "store_true",
            help = "also remove all vehicle suppliers (non-government organizations) and non-government users."
        )

    def handle(self, *args, **options):
        is_removing_inactive_users = options["inactive_users"]
        is_removing_users_without_orgs = options["users_without_orgs"]
        is_removing_orgs_without_users = options["orgs_without_users"]
        is_removing_non_gov = options["non_gov"]
        is_preserving_users_and_orgs = not (
            is_removing_inactive_users or
            is_removing_users_without_orgs or
            is_removing_orgs_without_users or
            is_removing_non_gov
        )

        print("WARNING: This command will reset the database to an almost empty state.", end=" ")
        if is_preserving_users_and_orgs:
            print("All user profiles and organizations will be preserved.")
        else:
            print("Some user profiles and organizations will be preserved EXCEPT the following:")
            if is_removing_inactive_users:
                print("- Inactive users will also be removed.")
            if is_removing_users_without_orgs:
                print("- User profiles without an organization will also be removed.")
            if is_removing_orgs_without_users:
                print("- Organizations without any associated users will also be removed.")
            if is_removing_non_gov:
                print("- Vehicle suppliers (non-government organizations) and non-government user profiles will also be removed.")
        
        confirmation = input("Are you sure you want to proceed? (y/N): ")
        if confirmation.lower() == "y":
            try:
                self.deleteData(
                    is_removing_inactive_users,
                    is_removing_users_without_orgs,
                    is_removing_orgs_without_users,
                    is_removing_non_gov
                )
                print("Completed resetting the database.")
            except Exception as e:
                print("Error: " + str(e))
                print("Changes are rolled back.")
        else:
            print("Operation cancelled.")

    @transaction.atomic
    def deleteData(self, is_removing_inactive_users, is_removing_users_without_orgs, is_removing_orgs_without_users, is_removing_non_gov_orgs):
        self.resetTables(self.tables_to_be_reset)
        if is_removing_inactive_users:
            self.deleteInactiveUsers()
        if is_removing_users_without_orgs:
            self.deleteUsersWithoutOrgs()
        if is_removing_orgs_without_users:
            self.deleteOrgsWithoutUsers()
        if is_removing_non_gov_orgs:
            self.deleteNonGovOrgs()

    def resetTables(self, tables):
        with connection.cursor() as cursor:
            for table_name in tables:
                print("Deleting all data from " + table_name + "...")
                cursor.execute("DELETE FROM %s" % table_name)

    def deleteInactiveUsers(self):
        inactive_user_profiles = UserProfile.objects.filter(is_active=False)
        print("Deleting " + str(len(inactive_user_profiles)) + " inactive user profiles...")
        for user_profile in inactive_user_profiles:
            user_profile.delete()

    def deleteUsersWithoutOrgs(self):
        users_without_orgs = UserProfile.objects.filter(organization__isnull=True)
        print("Deleting " + str(len(users_without_orgs)) + " user profiles without an organization...")
        for user_profile in users_without_orgs:
            user_profile.delete()
    
    def deleteOrgsWithoutUsers(self):
        organizations_without_users = Organization.objects.filter(userprofile__isnull=True)
        print("Deleting " + str(len(organizations_without_users)) + " organizations without associated users...")
        for organization in organizations_without_users:
            organization.delete()

    def deleteNonGovOrgs(self):
        non_gov_organizations = Organization.objects.filter(is_government=False)
        print("Deleting " + str(len(non_gov_organizations)) + " non-government organizations...")
        for organization in non_gov_organizations:
            organization.delete()
        self.deleteUsersWithoutOrgs()
