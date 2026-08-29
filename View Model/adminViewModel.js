const apiBaseUrl = window.HIND_PHARMA_API_URL || '';
const token = sessionStorage.getItem('hindPharmaToken');
const role = sessionStorage.getItem('hindPharmaRole');
const username = sessionStorage.getItem('hindPharmaUser');

if (!token || role !== 'admin') {
  location.href = 'login.html';
}

document.getElementById('adminName').textContent = username ? `Signed in as ${username}` : '';

document.getElementById('logoutButton').addEventListener('click', () => {
  sessionStorage.removeItem('hindPharmaUser');
  sessionStorage.removeItem('hindPharmaRole');
  sessionStorage.removeItem('hindPharmaToken');
  location.href = 'login.html';
});

async function api(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
  if (response.status === 401 || response.status === 403) {
    sessionStorage.clear();
    location.href = 'login.html';
    throw new Error('Admin session expired.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || 'Request failed.');
  return data;
}

function setMessage(id, text, success = false) {
  const element = document.getElementById(id);
  element.textContent = text;
  element.className = `message ${success ? 'success' : 'error'}`;
}

async function loadUsers() {
  const table = document.getElementById('usersTable');
  try {
    const users = await api('/admin/users');
    document.getElementById('userCount').textContent = users.length;
    table.innerHTML = users.map(user => `
      <tr><td>${escapeHtml(user.username)}</td><td><span class="pill ${user.role}">${user.role.toUpperCase()}</span></td>
      <td class="active">${user.is_active ? 'ACTIVE' : 'INACTIVE'}</td><td>${formatDate(user.created_at)}</td></tr>
    `).join('') || '<tr><td colspan="4">No users found.</td></tr>';
  } catch (error) {
    table.innerHTML = `<tr><td colspan="4">${escapeHtml(error.message)}</td></tr>`;
  }
}

async function loadMedicalCount() {
  try {
    const medicals = await api('/medical-names');
    document.getElementById('medicalCount').textContent = medicals.length;
  } catch (_) {}
}

document.getElementById('medicalForm').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    await api('/admin/medical-names', { method: 'POST', body: JSON.stringify({
      name: document.getElementById('medicalName').value,
      area: document.getElementById('medicalArea').value
    }) });
    event.target.reset();
    setMessage('medicalMessage', 'Medical added successfully.', true);
    loadMedicalCount();
  } catch (error) { setMessage('medicalMessage', error.message); }
});

document.getElementById('userForm').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    await api('/admin/users', { method: 'POST', body: JSON.stringify({
      username: document.getElementById('newUsername').value,
      password: document.getElementById('newPassword').value,
      role: document.getElementById('newRole').value
    }) });
    event.target.reset();
    setMessage('userMessage', 'User created successfully.', true);
    loadUsers();
  } catch (error) { setMessage('userMessage', error.message); }
});

document.getElementById('productForm').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    await api('/admin/products', { method: 'POST', body: JSON.stringify({
      id: document.getElementById('productId').value,
      name: document.getElementById('productName').value,
      code: document.getElementById('productCode').value,
      unit: document.getElementById('productUnit').value,
      mrp: document.getElementById('productMrp').value,
      formula: document.getElementById('productFormula').value,
      company: document.getElementById('productCompany').value
    }) });
    event.target.reset();
    setMessage('productMessage', 'Product added successfully.', true);
  } catch (error) { setMessage('productMessage', error.message); }
});

document.getElementById('refreshUsers').addEventListener('click', loadUsers);

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>\"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[character]));
}
function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
}

loadUsers();
loadMedicalCount();
