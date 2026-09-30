/* ========== FIB Winslow 14 — App ========== */

const STORAGE_KEY = 'fib_winslow14_data';
const SESSION_KEY = 'fib_winslow14_session';

let currentUser = null;
let currentForm = null;
let editIndex = null;
let editSection = null;

// Default seed data
const DEFAULT_DATA = {
    news: [
        {
            title: 'Добро пожаловать в систему FIB Winslow 14',
            body: 'Внутренний портал запущен. Все сотрудники получают доступ согласно своему уровню.\n\nУровни: Фибовец → Куратор → Зам. директора → Лидер.',
            author: 'System',
            date: '30.09.2026'
        }
    ],
    recommendations: [
        { nick: 'John_Doe', id: '15234', from: 'Agent_Smith', date: '28.09.2026', comment: 'Хорошие знания законов, активен', status: 'Одобрено' },
        { nick: 'Mike_Johnson', id: '18901', from: 'Agent_Brown', date: '29.09.2026', comment: 'Рекомендация на стажировку', status: 'На рассмотрении' }
    ],
    recruitments: [
        { nick: 'Alex_River', id: '20145', from: 'Agent_Miller', date: '25.09.2026', stage: 'Собеседование', status: 'В процессе' },
        { nick: 'Sarah_Connor', id: '17892', from: 'Agent_Wilson', date: '20.09.2026', stage: 'Финальная проверка', status: 'Завершена' }
    ],
    registry: [
        { org: 'LSPD', type: 'Плановая', from: 'Agent_Davis', date: '15.09.2026', result: 'Без нарушений', status: 'Закрыта' },
        { org: 'EMS', type: 'Внеплановая', from: 'Agent_Taylor', date: '22.09.2026', result: 'Требует доработки', status: 'В работе' }
    ],
    questionnaires: [
        { nick: 'Ivan_Petrov', id: '22341', type: 'Гражданский', date: '26.09.2026', from: 'Agent_Lee', status: 'На проверке' },
        { nick: 'Officer_Blake', id: '14567', type: 'Полиция', date: '24.09.2026', from: 'Agent_Kim', status: 'Одобрена' },
        { nick: 'CIU_Agent_X', id: '16789', type: 'CIU', date: '28.09.2026', from: 'Agent_Park', status: 'На рассмотрении' }
    ],
    blRecruitments: [
        { nick: 'Toxic_Player', id: '99812', reason: 'Многократные нарушения, токсичность', from: 'Agent_Boss', date: '10.09.2026', term: 'Бессрочно' },
        { nick: 'Fake_Agent', id: '55432', reason: 'Попытка обмана при вербовке', from: 'Agent_Secure', date: '18.09.2026', term: '30 дней' }
    ],
    blId: [
        { id: '77777', nick: 'Cheater_Pro', reason: 'Читы / эксплойты', from: 'Agent_Admin', date: '05.09.2026', term: 'Бессрочно' },
        { id: '33321', nick: '', reason: 'Подозрение в RDM / Mass RDM', from: 'Agent_Watch', date: '21.09.2026', term: '14 дней' }
    ]
};

function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {}
    const data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    saveData(data);
    return data;
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getData() {
    return loadData();
}

function updateData(key, arr) {
    const data = loadData();
    data[key] = arr;
    saveData(data);
}

/* ========== AUTH ========== */
function tryLogin(login, password) {
    const user = ACCESS_USERS.find(u => u.login === login && u.password === password);
    if (!user) return null;
    return { login: user.login, name: user.name, role: user.role, department: user.department };
}

function saveSession(user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function loadSession() {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
}

function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
}

function hasPerm(action, section) {
    if (!currentUser) return false;
    const perms = PERMISSIONS[currentUser.role];
    if (!perms) return false;
    if (action === 'manageNews') return perms.manageNews;
    if (action === 'manageUsers') return perms.manageUsers;
    const list = perms[action];
    return list && list.includes(section);
}

function applyPermissions() {
    document.querySelectorAll('.perm-add').forEach(btn => {
        const section = btn.dataset.section;
        if (hasPerm('add', section) || (section === 'news' && hasPerm('manageNews'))) {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    });
}

/* ========== RENDER ========== */
const BADGE = {
    'Одобрено': 'success', 'Одобрена': 'success', 'Завершена': 'success', 'Закрыта': 'success',
    'На рассмотрении': 'info', 'В процессе': 'info', 'Назначена': 'info',
    'На проверке': 'warning', 'В работе': 'warning',
    'Отклонено': 'danger', 'Отклонена': 'danger', 'Бессрочно': 'danger'
};

function badge(status) {
    const cls = BADGE[status] || 'info';
    return `<span class="badge badge-${cls}">${esc(status)}</span>`;
}

function termCell(term) {
    if ((term || '').toLowerCase().includes('бессроч')) {
        return `<span class="badge badge-danger">${esc(term)}</span>`;
    }
    return esc(term);
}

function typeTag(type) {
    const map = { 'Гражданский': 'type-civ', 'Полиция': 'type-pol', 'CIU': 'type-ciu' };
    return `<span class="type-tag ${map[type] || 'type-civ'}">${esc(type)}</span>`;
}

function typeData(type) {
    const map = { 'Гражданский': 'civilian', 'Полиция': 'police', 'CIU': 'ciu' };
    return map[type] || 'civilian';
}

function actionBtns(section, index) {
    let html = '';
    if (hasPerm('edit', section) || (section === 'news' && hasPerm('manageNews'))) {
        html += `<button class="btn-ghost btn-ghost-edit" onclick="editItem('${section}', ${index})" title="Изменить">✏️</button>`;
    }
    if (hasPerm('delete', section) || (section === 'news' && hasPerm('manageNews'))) {
        html += `<button class="btn-ghost" onclick="deleteItem('${section}', ${index})" title="Удалить">🗑️</button>`;
    }
    return html ? `<div class="td-actions">${html}</div>` : '—';
}

function renderAll() {
    const data = getData();
    renderNews(data.news);
    renderTable('rec-tbody', data.recommendations, (r, i) => `
        <td>${i + 1}</td><td>${esc(r.nick)}</td><td>${esc(r.id)}</td><td>${esc(r.from)}</td>
        <td>${esc(r.date)}</td><td>${esc(r.comment)}</td><td>${badge(r.status)}</td>
        <td>${actionBtns('recommendations', i)}</td>`);
    renderTable('recruit-tbody', data.recruitments, (r, i) => `
        <td>${i + 1}</td><td>${esc(r.nick)}</td><td>${esc(r.id)}</td><td>${esc(r.from)}</td>
        <td>${esc(r.date)}</td><td>${esc(r.stage)}</td><td>${badge(r.status)}</td>
        <td>${actionBtns('recruitments', i)}</td>`);
    renderTable('registry-tbody', data.registry, (r, i) => `
        <td>${i + 1}</td><td>${esc(r.org)}</td><td>${esc(r.type)}</td><td>${esc(r.from)}</td>
        <td>${esc(r.date)}</td><td>${esc(r.result) || '—'}</td><td>${badge(r.status)}</td>
        <td>${actionBtns('registry', i)}</td>`);
    renderTable('quest-tbody', data.questionnaires, (r, i) => `
        <td>${i + 1}</td><td>${esc(r.nick)}</td><td>${esc(r.id)}</td><td>${typeTag(r.type)}</td>
        <td>${esc(r.date)}</td><td>${esc(r.from)}</td><td>${badge(r.status)}</td>
        <td>${actionBtns('questionnaires', i)}</td>`, (r) => typeData(r.type));
    renderTable('blrec-tbody', data.blRecruitments, (r, i) => `
        <td>${i + 1}</td><td>${esc(r.nick)}</td><td>${esc(r.id)}</td><td>${esc(r.reason)}</td>
        <td>${esc(r.from)}</td><td>${esc(r.date)}</td><td>${termCell(r.term)}</td>
        <td>${actionBtns('bl-recruitments', i)}</td>`);
    renderTable('blid-tbody', data.blId, (r, i) => `
        <td>${i + 1}</td><td>${esc(r.id)}</td><td>${esc(r.nick) || '—'}</td><td>${esc(r.reason)}</td>
        <td>${esc(r.from)}</td><td>${esc(r.date)}</td><td>${termCell(r.term)}</td>
        <td>${actionBtns('bl-id', i)}</td>`);
}

function renderTable(tbodyId, arr, rowFn, dataTypeFn) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = '';
    (arr || []).forEach((item, i) => {
        const tr = document.createElement('tr');
        if (dataTypeFn) tr.dataset.type = dataTypeFn(item);
        tr.innerHTML = rowFn(item, i);
        tbody.appendChild(tr);
    });
}

function renderNews(arr) {
    const list = document.getElementById('news-list');
    if (!list) return;
    if (!arr || arr.length === 0) {
        list.innerHTML = '<div class="news-empty">Новостей пока нет</div>';
        return;
    }
    list.innerHTML = arr.map((n, i) => `
        <div class="news-card">
            <div class="news-card-header">
                <div class="news-card-title">${esc(n.title)}</div>
                <div class="news-card-meta">${esc(n.author)} • ${esc(n.date)}</div>
            </div>
            <div class="news-card-body">${esc(n.body)}</div>
            ${(hasPerm('manageNews')) ? `<div class="news-card-actions">
                <button class="btn btn-outline btn-sm" onclick="editItem('news', ${i})">Изменить</button>
                <button class="btn btn-outline btn-sm" onclick="deleteItem('news', ${i})">Удалить</button>
            </div>` : ''}
        </div>
    `).join('');
}

/* ========== MODAL FORMS ========== */
const FORMS = {
    news: {
        title: 'Опубликовать новость',
        section: 'news',
        dataKey: 'news',
        fields: [
            { name: 'title', label: 'Заголовок', type: 'text' },
            { name: 'body', label: 'Текст', type: 'textarea' }
        ]
    },
    rec: {
        title: 'Добавить рекомендацию',
        section: 'recommendations',
        dataKey: 'recommendations',
        fields: [
            { name: 'nick', label: 'ФИО / Ник', type: 'text' },
            { name: 'id', label: 'ID', type: 'text' },
            { name: 'from', label: 'Кто рекомендовал', type: 'text' },
            { name: 'date', label: 'Дата', type: 'date' },
            { name: 'comment', label: 'Комментарий', type: 'textarea' },
            { name: 'status', label: 'Статус', type: 'select', options: ['Одобрено', 'На рассмотрении', 'Отклонено'] }
        ]
    },
    recruit: {
        title: 'Новая вербовка',
        section: 'recruitments',
        dataKey: 'recruitments',
        fields: [
            { name: 'nick', label: 'Кандидат', type: 'text' },
            { name: 'id', label: 'ID', type: 'text' },
            { name: 'from', label: 'Вербовщик', type: 'text' },
            { name: 'date', label: 'Дата начала', type: 'date' },
            { name: 'stage', label: 'Этап', type: 'text' },
            { name: 'status', label: 'Статус', type: 'select', options: ['В процессе', 'Завершена', 'Отклонена'] }
        ]
    },
    registry: {
        title: 'Добавить проверку',
        section: 'registry',
        dataKey: 'registry',
        fields: [
            { name: 'org', label: 'Организация', type: 'text' },
            { name: 'type', label: 'Тип проверки', type: 'select', options: ['Плановая', 'Внеплановая', 'Специальная'] },
            { name: 'from', label: 'Ответственный', type: 'text' },
            { name: 'date', label: 'Дата', type: 'date' },
            { name: 'result', label: 'Результат', type: 'text' },
            { name: 'status', label: 'Статус', type: 'select', options: ['Назначена', 'В работе', 'Закрыта'] }
        ]
    },
    quest: {
        title: 'Новая анкета',
        section: 'questionnaires',
        dataKey: 'questionnaires',
        fields: [
            { name: 'nick', label: 'ФИО / Ник', type: 'text' },
            { name: 'id', label: 'ID', type: 'text' },
            { name: 'type', label: 'Тип', type: 'select', options: ['Гражданский', 'Полиция', 'CIU'] },
            { name: 'date', label: 'Дата подачи', type: 'date' },
            { name: 'from', label: 'Проверяющий', type: 'text' },
            { name: 'status', label: 'Статус', type: 'select', options: ['На проверке', 'Одобрена', 'На рассмотрении', 'Отклонена'] }
        ]
    },
    blrec: {
        title: 'Добавить в ЧС вербовок',
        section: 'bl-recruitments',
        dataKey: 'blRecruitments',
        fields: [
            { name: 'nick', label: 'ФИО / Ник', type: 'text' },
            { name: 'id', label: 'ID', type: 'text' },
            { name: 'reason', label: 'Причина', type: 'textarea' },
            { name: 'from', label: 'Кто добавил', type: 'text' },
            { name: 'date', label: 'Дата', type: 'date' },
            { name: 'term', label: 'Срок', type: 'text', placeholder: '30 дней или Бессрочно' }
        ]
    },
    blid: {
        title: 'Добавить ID в ЧС',
        section: 'bl-id',
        dataKey: 'blId',
        fields: [
            { name: 'id', label: 'ID', type: 'text' },
            { name: 'nick', label: 'Ник (если известен)', type: 'text' },
            { name: 'reason', label: 'Причина', type: 'textarea' },
            { name: 'from', label: 'Кто добавил', type: 'text' },
            { name: 'date', label: 'Дата', type: 'date' },
            { name: 'term', label: 'Срок', type: 'text', placeholder: '14 дней или Бессрочно' }
        ]
    }
};

// Map section name to form key for edit
const SECTION_TO_FORM = {
    news: 'news',
    recommendations: 'rec',
    recruitments: 'recruit',
    registry: 'registry',
    questionnaires: 'quest',
    'bl-recruitments': 'blrec',
    'bl-id': 'blid'
};

function openModal(type, existing) {
    currentForm = FORMS[type];
    if (!currentForm) return;
    editIndex = existing != null ? existing.index : null;
    editSection = existing != null ? existing.section : null;

    document.getElementById('modal-title').textContent =
        editIndex != null ? 'Редактировать' : currentForm.title;

    const body = document.getElementById('modal-body');
    body.innerHTML = '';

    currentForm.fields.forEach(f => {
        const group = document.createElement('div');
        group.className = 'form-group';
        const label = document.createElement('label');
        label.textContent = f.label;
        group.appendChild(label);

        let input;
        if (f.type === 'textarea') {
            input = document.createElement('textarea');
        } else if (f.type === 'select') {
            input = document.createElement('select');
            f.options.forEach(opt => {
                const o = document.createElement('option');
                o.value = opt;
                o.textContent = opt;
                input.appendChild(o);
            });
        } else {
            input = document.createElement('input');
            input.type = f.type;
        }
        input.name = f.name;
        input.id = 'field-' + f.name;
        if (f.placeholder) input.placeholder = f.placeholder;

        if (existing && existing.data) {
            let val = existing.data[f.name];
            if (f.type === 'date' && val && val.includes('.')) {
                // convert DD.MM.YYYY -> YYYY-MM-DD
                const p = val.split('.');
                if (p.length === 3) val = `${p[2]}-${p[1]}-${p[0]}`;
            }
            input.value = val || '';
        } else if (f.name === 'from' && currentUser) {
            input.value = currentUser.name;
        } else if (f.name === 'date' && f.type === 'date') {
            input.value = new Date().toISOString().slice(0, 10);
        }

        group.appendChild(input);
        body.appendChild(group);
    });

    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
    currentForm = null;
    editIndex = null;
    editSection = null;
}

function submitModal() {
    if (!currentForm) return;
    const values = {};
    currentForm.fields.forEach(f => {
        const el = document.getElementById('field-' + f.name);
        values[f.name] = el ? el.value.trim() : '';
    });

    if (values.date && values.date.includes('-')) {
        const d = new Date(values.date);
        if (!isNaN(d)) values.date = d.toLocaleDateString('ru-RU');
    }

    if (currentForm.dataKey === 'news') {
        values.author = currentUser.name;
        if (!values.date) values.date = new Date().toLocaleDateString('ru-RU');
    }

    const data = getData();
    const key = currentForm.dataKey;

    if (editIndex != null) {
        data[key][editIndex] = { ...data[key][editIndex], ...values };
    } else {
        data[key].push(values);
    }
    saveData(data);
    renderAll();
    closeModal();
}

function editItem(section, index) {
    const formKey = SECTION_TO_FORM[section];
    if (!formKey) return;
    const form = FORMS[formKey];
    const data = getData();
    const item = data[form.dataKey][index];
    if (!item) return;
    openModal(formKey, { index, section, data: item });
}

function deleteItem(section, index) {
    if (!confirm('Удалить запись?')) return;
    const formKey = SECTION_TO_FORM[section];
    if (!formKey) return;
    const form = FORMS[formKey];
    const data = getData();
    data[form.dataKey].splice(index, 1);
    saveData(data);
    renderAll();
}

function esc(str) {
    if (str == null || str === '') return '';
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
}

/* ========== TABS & FILTERS ========== */
function initTabs() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const tab = document.getElementById(btn.dataset.tab);
            if (tab) tab.classList.add('active');
        });
    });
}

function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            document.querySelectorAll('#quest-tbody tr').forEach(row => {
                row.style.display = (filter === 'all' || row.dataset.type === filter) ? '' : 'none';
            });
        });
    });
}

/* ========== LOGIN / LOGOUT ========== */
function showApp(user) {
    currentUser = user;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('header-name').textContent = user.name;
    document.getElementById('header-role').textContent = ROLE_LABELS[user.role] || user.role;
    applyPermissions();
    renderAll();
}

function showLogin() {
    currentUser = null;
    document.getElementById('app').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';
    document.getElementById('login-error').classList.add('hidden');
}

function initAuth() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const login = document.getElementById('login-user').value.trim();
        const pass = document.getElementById('login-pass').value;
        const err = document.getElementById('login-error');
        const user = tryLogin(login, pass);
        if (!user) {
            err.textContent = 'Неверный логин или пароль';
            err.classList.remove('hidden');
            return;
        }
        err.classList.add('hidden');
        saveSession(user);
        showApp(user);
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
        clearSession();
        showLogin();
    });

    // Auto-login if session exists
    const session = loadSession();
    if (session) {
        showApp(session);
    }
}

/* ========== INIT ========== */
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initFilters();
    initAuth();

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeModal();
    });
});
