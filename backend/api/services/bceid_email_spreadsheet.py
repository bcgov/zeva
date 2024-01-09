from django.http import HttpResponse
import io
import xlwt
from datetime import datetime
from api.models.user_profile import UserProfile

BOLD = xlwt.easyxf('font: name Times New Roman, bold on;')
LOCKED = xlwt.easyxf('protection: cell_locked true;')

def create_bceid_emails_sheet():
    sheet_name = 'Active BCeID Emails'

    output = io.BytesIO()
    workbook = xlwt.Workbook('Emails.xls')
    workbook.protect = True

    descriptor = {
        'version': 2,
        'create_time': datetime.utcnow().timestamp(),
        'sheets': []
    }

    worksheet = workbook.add_sheet(sheet_name)
    worksheet.protect = True
    descriptor['sheets'].append({
        'index': 1,
        'name': sheet_name
    })

    row = 0

    worksheet.write(row, 0, 'Organization', style=BOLD)
    worksheet.write(row, 1, 'Email', style=BOLD)

    users = UserProfile.objects.filter(is_active=True).exclude(organization__is_government='True').values('organization__name', 'email')

    users_list = list(users)

    for user in users_list:
        row += 1
        if user['email'] and user['organization__name']:
            worksheet.write(row, 0, user['organization__name'], style=LOCKED)
            worksheet.write(row, 1, user['email'], style=LOCKED)

    org_col = worksheet.col(0)
    org_col.width = 256 * 30

    email_col = worksheet.col(1)
    email_col.width = 256 * 30  # 30 characters for VIN

    workbook.save(output)
    output.seek(0)

    filename = 'active_bceid_users.xls'
    response = HttpResponse(output.getvalue(), content_type='application/vnd.ms-excel')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'

    return response