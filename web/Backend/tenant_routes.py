from datetime import date
from fastapi import Depends, HTTPException
from pydantic import BaseModel
from .database import get_connection
from .main import _principal, _require
from Helper.password import hash_password

class ShopApplicationInput(BaseModel):
    admin_username: str
    admin_name: str
    business_name: str
    subtitle: str | None = None
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    dl_20b: str | None = None
    dl_21b: str | None = None
    fssai: str | None = None
    gstin: str | None = None
    logo: str | None = None
    barcode: str | None = None
    upi: str | None = None
    amount: float = 0

class PaymentConfirmation(BaseModel):
    transaction_id: str
    payment_method: str | None = None
    amount: float

def register(app):
    @app.post('/api/super-admin/shop-applications')
    def create_shop_application(item: ShopApplicationInput, principal=Depends(_principal)):
        _require(principal, 'super_admin')
        username=item.admin_username.strip(); business=item.business_name.strip()
        if not username or not business: raise HTTPException(400,'Admin username and shop name are required')
        with get_connection() as db:
            if db.execute('SELECT 1 FROM admins WHERE lower(username)=lower(?)',(username,)).fetchone(): raise HTTPException(409,'Admin username already exists')
            slug=business.lower()
            import re
            slug=re.sub(r'[^a-z0-9]+','-',slug).strip('-') or 'shop'
            base=slug; n=2
            while db.execute('SELECT 1 FROM superAdminTenants WHERE slug=?',(slug,)).fetchone(): slug=f'{base}-{n}'; n+=1
            tenant=db.execute('''INSERT INTO superAdminTenants(slug,business_name,subtitle,address,phone,email,dl_20b,dl_21b,fssai,gstin,logo,barcode,upi,is_active) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,0)''',(slug,business,item.subtitle,item.address,item.phone,item.email,item.dl_20b,item.dl_21b,item.fssai,item.gstin,item.logo,item.barcode,item.upi)).lastrowid
            application=db.execute('INSERT INTO superAdminApplications(tenant_id,admin_username,admin_name) VALUES(?,?,?)',(tenant,username,item.admin_name)).lastrowid
            db.execute('INSERT INTO superAdminPayments(application_id,tenant_id,amount) VALUES(?,?,?)',(application,tenant,item.amount))
            db.execute('INSERT INTO superAdminActivityLogs(action,tenant_id,application_id,details) VALUES(?,?,?,?)',('CREATE_APPLICATION',tenant,application,business))
        return {'status':'pending_payment','application_id':application,'tenant_id':tenant,'slug':slug}

    @app.post('/api/super-admin/shop-applications/{application_id}/payment')
    def confirm_payment(application_id:int,item:PaymentConfirmation,principal=Depends(_principal)):
        _require(principal,'super_admin')
        if not item.transaction_id.strip(): raise HTTPException(400,'Transaction ID is required')
        today=date.today()
        try: expiry=today.replace(year=today.year+1)
        except ValueError: expiry=today.replace(year=today.year+1,day=28)
        with get_connection() as db:
            application=db.execute('SELECT * FROM superAdminApplications WHERE id=?',(application_id,)).fetchone()
            if not application: raise HTTPException(404,'Application not found')
            if application['application_status']=='active': return {'status':'already_active','tenant_id':application['tenant_id']}
            tenant=db.execute('SELECT * FROM superAdminTenants WHERE id=?',(application['tenant_id'],)).fetchone()
            payment=db.execute('SELECT * FROM superAdminPayments WHERE application_id=? ORDER BY id DESC LIMIT 1',(application_id,)).fetchone()
            db.execute('UPDATE superAdminPayments SET amount=?,payment_status=?,transaction_id=?,payment_method=?,paid_at=CURRENT_TIMESTAMP WHERE id=?',(item.amount,'paid',item.transaction_id.strip(),item.payment_method,payment['id']))
            cursor=db.execute('''INSERT INTO admins(username,password_hash,name,business_name,phone,email,address,tenant_id,subscription_plan,subscription_start,subscription_expiry) VALUES(?,?,?,?,?,?,?,?,?,?,?)''',(application['admin_username'],hash_password(f"{application['admin_username']}@123"),application['admin_name'],tenant['business_name'],tenant['phone'],tenant['email'],tenant['address'],tenant['id'],'YEARLY',today.isoformat(),expiry.isoformat()))
            admin_id=cursor.lastrowid
            db.execute('UPDATE superAdminTenants SET is_active=1,updated_at=CURRENT_TIMESTAMP WHERE id=?',(tenant['id'],))
            db.execute('UPDATE superAdminApplications SET application_status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?',('active',application_id))
            db.execute('INSERT INTO superAdminActivityLogs(action,tenant_id,application_id,details) VALUES(?,?,?,?)',('PAYMENT_CONFIRMED_AND_ADMIN_GENERATED',tenant['id'],application_id,f'admin_id={admin_id}'))
        return {'status':'active','admin_id':admin_id,'username':application['admin_username'],'initial_password':f"{application['admin_username']}@123",'shop_url':f'/shop/{tenant["slug"]}'}
