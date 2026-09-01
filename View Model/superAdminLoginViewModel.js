import { TempDataService } from '../temp/temp_file_dataService.js?v=20260901-8';
import { TempSessionService } from '../temp/temp_file_sessionService.js?v=20260901-8';
const form=document.getElementById('superAdminForm'),error=document.getElementById('error');
const service=new TempDataService();
if(TempSessionService.isSuperAdmin())location.replace('htg-super-admin.html');
form.addEventListener('submit',async event=>{event.preventDefault();error.textContent='';const username=document.getElementById('username').value.trim(),password=document.getElementById('password').value;try{const accounts=service.getAccounts();const account=accounts.find(a=>a.username?.toLowerCase()===username.toLowerCase()&&a.role==='super_admin');if(!account||account.password!==password)throw new Error('Invalid HTG Super Admin credentials.');if(account.is_active===false)throw new Error('HTG Super Admin account is inactive.');const user=await service.authenticateUser(username,password);if(!user||user.role!=='super_admin')throw new Error('Invalid HTG Super Admin credentials.');TempSessionService.save(user);location.replace('htg-super-admin.html')}catch(e){error.textContent=e.message||'Login failed.'}});
