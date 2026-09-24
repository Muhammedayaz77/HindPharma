import { TempAuthDataSource } from '../temp/temp_file_authDataSource.js';
import { TempSessionService } from '../temp/temp_file_sessionService.js';
const form=document.getElementById('superAdminForm'),error=document.getElementById('error');
const auth=new TempAuthDataSource();
if(TempSessionService.isSuperAdmin())location.replace('htg-super-admin.html');
form.addEventListener('submit',async event=>{
 event.preventDefault();error.textContent='';
 const username=document.getElementById('username').value.trim(),password=document.getElementById('password').value;
 try{const user=await auth.login(username,password);if(user.role!=='super_admin')throw new Error('HTG Super Admin credentials required.');TempSessionService.save(user);location.replace('htg-super-admin.html')}
 catch(e){error.textContent=e.message||'Login failed.'}
});
