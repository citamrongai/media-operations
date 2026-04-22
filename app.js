// In-Memory Data Store (Simulating a backend DB)
let store = {
    services: [],
    blackoutDates: [],
    volunteers: []
};

const STORAGE_KEY = 'citam_rongai_store_v1';

function saveStore() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
        console.error("Failed to save to localStorage", e);
    }
}

function loadStore() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            store = JSON.parse(saved);
        }
    } catch (e) {
        console.error("Failed to load from localStorage", e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Load persisted data
    loadStore();

    // Skeleton reveal — short strict delay then fade out
    const skeleton = document.getElementById('skeleton-screen');
    if (skeleton) {
        setTimeout(() => {
            skeleton.classList.add('hidden');
            setTimeout(() => skeleton.remove(), 400); // remove after fade transition
        }, 700);
    }

    // SPA Navigation Logic
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        if(item.classList.contains('ext-link')) return; // skip external links

        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            
            // Update Active Nav
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            // Update Views
            views.forEach(v => v.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            // Re-render if switching to specific views
            if(targetId === 'dashboard-view') renderDashboard();
            if(targetId === 'services-view') renderServices();
            if(targetId === 'people-view') renderPeople();
        });
    });

    // Form Submissions
    document.getElementById('blackout-form').addEventListener('submit', handleBlackoutSubmit);
    document.getElementById('create-service-form').addEventListener('submit', handleCreateService);
    document.getElementById('add-item-form').addEventListener('submit', handleAddItem);
    document.getElementById('assign-person-form').addEventListener('submit', handleAssignPerson);

    // Initial Renders
    renderDashboard();
    populateServiceDropdown();

    // Start Clock
    startClock();
});

function startClock() {
    const clockEl = document.getElementById('digital-clock');
    const dateEl = document.getElementById('date-display');
    
    function update() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = now.toLocaleTimeString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).split(',')[0].toUpperCase() + ', ' + 
                        now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase();
        
        if(clockEl) clockEl.innerText = timeStr;
        if(dateEl) dateEl.innerText = dateStr;
    }
    
    update();
    setInterval(update, 1000);
}

// Modal Logic
function openModal(id) {
    document.getElementById(id).style.display = 'flex';
    if(id === 'person-modal') populateServiceDropdown();
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function openServiceModal(serviceId = null) {
    const modal = document.getElementById('service-modal');
    const form = document.getElementById('create-service-form');
    const title = modal.querySelector('h3');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (serviceId) {
        const service = store.services.find(s => s.id == serviceId);
        title.innerText = 'Update Service';
        submitBtn.innerText = 'Update Service';
        document.getElementById('service-date').value = service.date;
        document.getElementById('service-theme').value = service.theme;
        form.dataset.editId = serviceId;
    } else {
        title.innerText = 'Create a Service';
        submitBtn.innerText = 'Save Service';
        form.reset();
        delete form.dataset.editId;
    }
    openModal('service-modal');
}

function openItemsModal(serviceId) {
    document.getElementById('current-service-id').value = serviceId;
    const service = store.services.find(s => s.id == serviceId);
    document.getElementById('items-modal-title').innerText = `Sequence: ${service.theme}`;
    renderServiceItems(service);
    openModal('items-modal');
}

// Handlers
function handleBlackoutSubmit(e) {
    e.preventDefault();
    const date = document.getElementById('blackout-date').value;
    const reason = document.getElementById('blackout-reason').value;
    
    store.blackoutDates.push({ date, reason });
    saveStore();
    e.target.reset();
    renderDashboard();
}

function handleCreateService(e) {
    e.preventDefault();
    const date = document.getElementById('service-date').value;
    const theme = document.getElementById('service-theme').value;
    const editId = e.target.dataset.editId;
    
    if (editId) {
        // Update existing
        const service = store.services.find(s => s.id == editId);
        service.date = date;
        service.theme = theme;
    } else {
        // Create new
        const newService = {
            id: Date.now(),
            date,
            theme,
            items: []
        };
        store.services.push(newService);
    }
    
    saveStore();
    closeModal('service-modal');
    e.target.reset();
    delete e.target.dataset.editId;
    renderServices();
    renderDashboard();
    populateServiceDropdown();
}

function handleAddItem(e) {
    e.preventDefault();
    const serviceId = document.getElementById('current-service-id').value;
    const name = document.getElementById('item-name').value;
    const lyrics = document.getElementById('item-lyrics').value;
    const comments = document.getElementById('item-comments').value;
    const editIndex = document.getElementById('edit-item-index').value;

    const service = store.services.find(s => s.id == serviceId);
    if(service) {
        const itemObj = { name, lyrics, comments };
        if (editIndex !== "") {
            service.items[editIndex] = itemObj;
            document.getElementById('edit-item-index').value = "";
            document.getElementById('add-item-submit').innerText = "Add Song";
        } else {
            service.items.push(itemObj);
        }
        saveStore();
        e.target.reset();
        renderServiceItems(service);
        renderServices(); // update counts on cards
    }
}

function handleAssignPerson(e) {
    e.preventDefault();
    const name = document.getElementById('person-name').value;
    const role = document.getElementById('person-role').value;
    const serviceId = document.getElementById('person-service').value;

    const service = store.services.find(s => s.id == serviceId);
    const serviceDisplay = service ? `${service.theme} (${service.date})` : 'General';

    store.volunteers.push({ name, role, serviceId, serviceDisplay });
    saveStore();
    closeModal('person-modal');
    e.target.reset();
    renderPeople();
}

// Render Functions
function renderDashboard() {
    // Render Upcoming Services
    const upcomingList = document.getElementById('upcoming-services-list');
    upcomingList.innerHTML = '';
    if (store.services.length === 0) {
        upcomingList.innerHTML = '<li class="empty-state">No upcoming services.</li>';
    } else {
        // Sort by date roughly
        const sorted = [...store.services].sort((a,b) => new Date(a.date) - new Date(b.date));
        sorted.slice(0, 5).forEach(s => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${s.date}</strong> - ${s.theme} <span style="color:#666; font-size:0.8rem">(${s.items.length} items)</span>`;
            upcomingList.appendChild(li);
        });
    }

    // Render Blackout Dates
    const blackoutList = document.getElementById('blackout-list');
    blackoutList.innerHTML = '';
    store.blackoutDates.forEach((b, index) => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        li.innerHTML = `
            <span><strong>${b.date}</strong> <span style="color:var(--neon-red)">Unavailable</span> - ${b.reason || 'No reason provided'}</span>
            <button class="btn-del icon-btn" onclick="deleteBlackout(${index})">X</button>
        `;
        blackoutList.appendChild(li);
    });
}

function renderServices() {
    const container = document.getElementById('services-container');
    container.innerHTML = '';

    if (store.services.length === 0) {
        container.innerHTML = '<div class="empty-state" style="grid-column: 1/-1">No services created yet.</div>';
        return;
    }

    store.services.forEach(s => {
        const card = document.createElement('div');
        card.className = 'card data-card';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h3>${s.date}</h3>
                    <p class="theme-text">${s.theme}</p>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button class="btn-edit icon-btn" onclick="openServiceModal(${s.id})">Edit</button>
                    <button class="btn-del icon-btn" onclick="deleteService(${s.id})">Delete</button>
                </div>
            </div>
            <p class="card-desc mt-20">${s.items.length} Items Scheduled</p>
            <div class="controls mt-20">
                <button class="btn-secondary sm-btn" onclick="openItemsModal(${s.id})">Manage Items</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderServiceItems(service) {
    const list = document.getElementById('service-items-list');
    list.innerHTML = '';
    
    if (service.items.length === 0) {
        list.innerHTML = '<li class="empty-state">No items in this sequence.</li>';
        return;
    }

    service.items.forEach((item, index) => {
        const li = document.createElement('li');
        li.style.flexDirection = 'column';
        li.style.alignItems = 'stretch';
        li.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
                <span><span style="color:var(--neon-red)">${index + 1}.</span> <strong>${item.name}</strong></span>
                <div style="display: flex; gap: 5px;">
                    <button class="btn-edit icon-btn" onclick="editServiceItem(${service.id}, ${index})">Edit</button>
                    <button class="btn-del icon-btn" onclick="deleteServiceItem(${service.id}, ${index})">X</button>
                </div>
            </div>
            ${item.comments ? `<p style="font-size: 0.8rem; color: #888; margin-bottom: 5px;">Note: ${item.comments}</p>` : ''}
            ${item.lyrics ? `
                <div style="display: flex; gap: 5px; align-items: center; margin-top: 5px;">
                    <div class="lyrics-preview" onclick="this.classList.toggle('expanded')" style="flex: 1; font-size: 0.75rem; color: #555; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; cursor: pointer; max-height: 40px; overflow: hidden; white-space: pre-wrap; transition: max-height 0.3s ease;">${item.lyrics}</div>
                    <button class="btn-copy" onclick="copyLyrics(${service.id}, ${index}, this)">📋 Copy</button>
                </div>
                <span style="font-size: 0.65rem; color: #444; display: block; margin-top: 2px;">(Click lyrics to expand)</span>
            ` : ''}
        `;
        list.appendChild(li);
    });
}

function renderPeople() {
    const container = document.getElementById('people-container');
    container.innerHTML = '';

    if (store.volunteers.length === 0) {
        container.innerHTML = '<div class="empty-state" style="grid-column: 1/-1">No volunteers assigned.</div>';
        return;
    }

    store.volunteers.forEach((v, index) => {
        const card = document.createElement('div');
        card.className = 'card data-card';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h3>${v.name}</h3>
                    <p class="role-badge">${v.role}</p>
                </div>
                <button class="btn-del icon-btn" onclick="deleteVolunteer(${index})">X</button>
            </div>
            <p class="card-desc mt-20">Assigned: ${v.serviceDisplay}</p>
        `;
        container.appendChild(card);
    });
}

function populateServiceDropdown() {
    const select = document.getElementById('person-service');
    select.innerHTML = '';
    if(store.services.length === 0) {
        select.innerHTML = '<option disabled selected>No services available (Create one first)</option>';
        return;
    }
    
    store.services.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.innerText = `${s.date} - ${s.theme}`;
        select.appendChild(opt);
    });
}

// Delete Handlers
window.deleteService = function(id) {
    store.services = store.services.filter(s => s.id !== id);
    store.volunteers = store.volunteers.filter(v => v.serviceId != id);
    saveStore();
    renderServices();
    renderDashboard();
    populateServiceDropdown();
    renderPeople();
};

window.deleteBlackout = function(index) {
    store.blackoutDates.splice(index, 1);
    saveStore();
    renderDashboard();
};

window.deleteServiceItem = function(serviceId, itemIndex) {
    const service = store.services.find(s => s.id == serviceId);
    if(service) {
        service.items.splice(itemIndex, 1);
        saveStore();
        renderServiceItems(service);
        renderServices();
    }
};

window.deleteVolunteer = function(index) {
    store.volunteers.splice(index, 1);
    saveStore();
    renderPeople();
};

window.editServiceItem = function(serviceId, itemIndex) {
    const service = store.services.find(s => s.id == serviceId);
    if(service) {
        const item = service.items[itemIndex];
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-lyrics').value = item.lyrics || '';
        document.getElementById('item-comments').value = item.comments || '';
        document.getElementById('edit-item-index').value = itemIndex;
        document.getElementById('add-item-submit').innerText = "Update Song";
    }
};

window.copyLyrics = function(serviceId, itemIndex, btn) {
    const service = store.services.find(s => s.id == serviceId);
    if(service && service.items[itemIndex]) {
        const lyrics = service.items[itemIndex].lyrics;
        if(lyrics) {
            navigator.clipboard.writeText(lyrics).then(() => {
                const originalText = btn.innerText;
                btn.innerText = '✅ Copied!';
                btn.style.borderColor = 'var(--neon-red)';
                btn.style.color = 'white';
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    btn.style.color = '#888';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
                btn.innerText = '❌ Failed';
                setTimeout(() => { btn.innerText = '📋 Copy'; }, 2000);
            });
        }
    }
};
