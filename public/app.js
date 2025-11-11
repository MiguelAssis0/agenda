// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAfKUdPBJKjAGPuV3I-u5PztLS-bFtZSB4",
    authDomain: "todolist-a606d.firebaseapp.com",
    projectId: "todolist-a606d",
    storageBucket: "todolist-a606d.appspot.com",
    messagingSenderId: "135648246164",
    appId: "1:135648246164:web:6e4aff4a03d274dace3781"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Global State
let currentUser = null;
let currentUserData = null;

// Navigation
function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const pageElement = document.getElementById(`page-${page}`);
    if (pageElement) {
        pageElement.classList.remove('hidden');
        pageElement.classList.add('fade-in');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Auth State Observer
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        const userDoc = await db.collection('users').doc(user.uid).get();
        currentUserData = userDoc.data();
        
        document.getElementById('nav-links').classList.add('hidden');
        document.getElementById('nav-user').classList.remove('hidden');
        document.getElementById('user-name').textContent = currentUserData?.name || user.email;
        
        if (window.location.hash === '' || window.location.hash === '#home') {
            navigateTo('dashboard');
            loadDashboard();
        }
    } else {
        currentUser = null;
        currentUserData = null;
        document.getElementById('nav-links').classList.remove('hidden');
        document.getElementById('nav-user').classList.add('hidden');
        if (window.location.hash === '#dashboard') {
            navigateTo('home');
        }
    }
});

// Register
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const role = formData.get('role');

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await db.collection('users').doc(userCredential.user.uid).set({
            name,
            email,
            role,
            plan: role === 'empresa' ? 'enterprise' : 'free',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showNotification('Cadastro realizado com sucesso!');
        navigateTo('dashboard');
        loadDashboard();
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
        await auth.signInWithEmailAndPassword(email, password);
        showNotification('Login realizado com sucesso!');
        navigateTo('dashboard');
        loadDashboard();
    } catch (error) {
        showNotification('Email ou senha incorretos', 'error');
    }
});

// Logout
function logout() {
    auth.signOut();
    navigateTo('home');
    showNotification('Logout realizado com sucesso!');
}

// Select Plan
async function selectPlan(plan) {
    if (!currentUser) {
        showNotification('Faça login para assinar um plano', 'error');
        navigateTo('login');
        return;
    }

    if (plan === 'free') {
        showNotification('Você já está no plano Free', 'error');
        return;
    }

    try {
        await db.collection('users').doc(currentUser.uid).update({
            plan: plan,
            planUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        currentUserData.plan = plan;
        showNotification(`Plano ${plan.toUpperCase()} ativado com sucesso!`);
        loadDashboard();
    } catch (error) {
        showNotification('Erro ao atualizar plano', 'error');
    }
}

// Load Dashboard
async function loadDashboard() {
    if (!currentUser || !currentUserData) return;

    document.querySelectorAll('.dashboard-content').forEach(d => d.classList.add('hidden'));
    
    const role = currentUserData.role;
    const dashboardElement = document.getElementById(`dashboard-${role}`);
    
    if (dashboardElement) {
        dashboardElement.classList.remove('hidden');
        
        if (role === 'mentorado') {
            loadMentoradoDashboard();
        } else if (role === 'mentor') {
            loadMentorDashboard();
        } else if (role === 'empresa') {
            loadEmpresaDashboard();
        }
    }
}

// Mentorado Dashboard
async function loadMentoradoDashboard() {
    const container = document.getElementById('dashboard-mentorado');
    
    // Get profile
    const profileDoc = await db.collection('profiles').doc(currentUser.uid).get();
    const profile = profileDoc.data();
    
    container.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 py-8">
            <div class="mb-8">
                <h2 class="text-3xl font-bold mb-2">Dashboard do Mentorado</h2>
                <p class="text-gray-600">Plano: <span class="font-semibold text-blue-600">${currentUserData.plan.toUpperCase()}</span></p>
                ${currentUserData.plan === 'free' ? '<button onclick="navigateTo(\'pricing\')" class="mt-2 text-sm text-blue-600 hover:underline">Upgrade para Pro →</button>' : ''}
            </div>

            <div class="grid md:grid-cols-2 gap-8">
                <!-- Profile Section -->
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-bold mb-4">Meu Currículo</h3>
                    <form id="profile-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                            <input type="tel" name="phone" value="${profile?.phone || ''}" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Profissão</label>
                            <input type="text" name="profession" value="${profile?.profession || ''}" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Experiência (anos)</label>
                            <input type="number" name="experience" value="${profile?.experience || 0}" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Habilidades (separadas por vírgula)</label>
                            <textarea name="skills" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">${profile?.skills || ''}</textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Sobre mim</label>
                            <textarea name="bio" rows="4" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">${profile?.bio || ''}</textarea>
                        </div>
                        <div class="flex items-center">
                            <input type="checkbox" name="isPCD" id="isPCD" ${profile?.isPCD ? 'checked' : ''} class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                            <label for="isPCD" class="ml-2 text-sm font-medium text-gray-700">Sou Pessoa com Deficiência (PCD)</label>
                        </div>
                        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-semibold">Salvar Currículo</button>
                    </form>
                </div>

                <!-- Mentors Section -->
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-bold mb-4">Buscar Mentores</h3>
                    <div id="mentors-list" class="space-y-4"></div>
                </div>
            </div>

            <!-- Mentorships Section -->
            <div class="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-bold mb-4">Minhas Mentorias</h3>
                <div id="mentorships-list" class="space-y-4"></div>
            </div>
        </div>
    `;

    // Profile form handler
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            await db.collection('profiles').doc(currentUser.uid).set({
                userId: currentUser.uid,
                name: currentUserData.name,
                email: currentUserData.email,
                phone: formData.get('phone'),
                profession: formData.get('profession'),
                experience: parseInt(formData.get('experience')),
                skills: formData.get('skills'),
                bio: formData.get('bio'),
                isPCD: document.getElementById('isPCD').checked,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            showNotification('Currículo salvo com sucesso!');
        } catch (error) {
            showNotification('Erro ao salvar currículo', 'error');
        }
    });

    // Load mentors
    loadMentorsList();
    loadMentorshipsList();
}

// Load Mentors List
async function loadMentorsList() {
    const mentorsSnapshot = await db.collection('mentors').get();
    const mentorsList = document.getElementById('mentors-list');
    
    if (mentorsSnapshot.empty) {
        mentorsList.innerHTML = '<p class="text-gray-500 text-center">Nenhum mentor disponível no momento</p>';
        return;
    }

    mentorsList.innerHTML = '';
    mentorsSnapshot.forEach(doc => {
        const mentor = doc.data();
        const div = document.createElement('div');
        div.className = 'border border-gray-200 rounded-lg p-4';
        div.innerHTML = `
            <h4 class="font-semibold text-lg">${mentor.name}</h4>
            <p class="text-sm text-gray-600">${mentor.specialty}</p>
            <p class="text-sm text-gray-500 mt-2">${mentor.bio || ''}</p>
            <div class="mt-3 flex items-center justify-between">
                <span class="text-sm font-medium ${mentor.isFree ? 'text-green-600' : 'text-blue-600'}">
                    ${mentor.isFree ? 'Gratuito' : `R$ ${mentor.price}/hora`}
                </span>
                <button onclick="scheduleMentorship('${doc.id}', ${mentor.isFree})" 
                    class="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700">
                    Agendar
                </button>
            </div>
        `;
        mentorsList.appendChild(div);
    });
}

// Schedule Mentorship
async function scheduleMentorship(mentorId, isFree) {
    if (!currentUser) return;

    // Check plan restrictions
    if (!isFree && currentUserData.plan === 'free') {
        showNotification('Upgrade para o plano Pro para agendar mentorias pagas', 'error');
        navigateTo('pricing');
        return;
    }

    const date = prompt('Digite a data desejada (DD/MM/YYYY):');
    const time = prompt('Digite o horário desejado (HH:MM):');
    
    if (!date || !time) return;

    try {
        await db.collection('mentorships').add({
            mentoradoId: currentUser.uid,
            mentoradoName: currentUserData.name,
            mentorId: mentorId,
            date: date,
            time: time,
            status: 'pending',
            isFree: isFree,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showNotification('Solicitação de mentoria enviada!');
        loadMentorshipsList();
    } catch (error) {
        showNotification('Erro ao agendar mentoria', 'error');
    }
}

// Load Mentorships List
async function loadMentorshipsList() {
    const mentorshipsSnapshot = await db.collection('mentorships')
        .where('mentoradoId', '==', currentUser.uid)
        .get();
    
    const mentorshipsList = document.getElementById('mentorships-list');
    
    if (mentorshipsSnapshot.empty) {
        mentorshipsList.innerHTML = '<p class="text-gray-500 text-center">Você ainda não tem mentorias agendadas</p>';
        return;
    }

    mentorshipsList.innerHTML = '';
    for (const doc of mentorshipsSnapshot.docs) {
        const mentorship = doc.data();
        const mentorDoc = await db.collection('mentors').doc(mentorship.mentorId).get();
        const mentor = mentorDoc.data();
        
        const div = document.createElement('div');
        div.className = 'border border-gray-200 rounded-lg p-4 flex justify-between items-center';
        div.innerHTML = `
            <div>
                <h4 class="font-semibold">${mentor?.name || 'Mentor'}</h4>
                <p class="text-sm text-gray-600">${mentorship.date} às ${mentorship.time}</p>
                <span class="text-xs px-2 py-1 rounded ${
                    mentorship.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    mentorship.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                }">${
                    mentorship.status === 'pending' ? 'Pendente' :
                    mentorship.status === 'confirmed' ? 'Confirmada' :
                    'Cancelada'
                }</span>
            </div>
            ${mentorship.status === 'pending' ? `
                <button onclick="cancelMentorship('${doc.id}')" class="text-red-600 hover:text-red-800 text-sm">Cancelar</button>
            ` : ''}
        `;
        mentorshipsList.appendChild(div);
    }
}

// Cancel Mentorship
async function cancelMentorship(mentorshipId) {
    if (confirm('Deseja realmente cancelar esta mentoria?')) {
        try {
            await db.collection('mentorships').doc(mentorshipId).update({
                status: 'cancelled'
            });
            showNotification('Mentoria cancelada');
            loadMentorshipsList();
        } catch (error) {
            showNotification('Erro ao cancelar mentoria', 'error');
        }
    }
}

// Mentor Dashboard
async function loadMentorDashboard() {
    const container = document.getElementById('dashboard-mentor');
    
    const mentorDoc = await db.collection('mentors').doc(currentUser.uid).get();
    const mentor = mentorDoc.data();
    
    container.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 py-8">
            <div class="mb-8">
                <h2 class="text-3xl font-bold mb-2">Dashboard do Mentor</h2>
                <p class="text-gray-600">Plano: <span class="font-semibold text-green-600">${currentUserData.plan.toUpperCase()}</span></p>
            </div>

            <div class="grid md:grid-cols-2 gap-8">
                <!-- Mentor Profile -->
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-bold mb-4">Meu Perfil de Mentor</h3>
                    <form id="mentor-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
                            <input type="text" name="specialty" value="${mentor?.specialty || ''}" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Sobre mim</label>
                            <textarea name="bio" rows="4" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">${mentor?.bio || ''}</textarea>
                        </div>
                        <div class="flex items-center">
                            <input type="checkbox" name="isFree" id="isFree" ${mentor?.isFree ? 'checked' : ''} class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                            <label for="isFree" class="ml-2 text-sm font-medium text-gray-700">Oferecer mentorias gratuitas</label>
                        </div>
                        <div id="price-field" class="${mentor?.isFree ? 'hidden' : ''}">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Preço por hora (R$)</label>
                            <input type="number" name="price" value="${mentor?.price || 0}" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                        </div>
                        <button type="submit" class="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 font-semibold">Salvar Perfil</button>
                    </form>
                </div>

                <!-- Mentorship Requests -->
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-bold mb-4">Solicitações de Mentoria</h3>
                    <div id="mentor-requests-list" class="space-y-4"></div>
                </div>
            </div>
        </div>
    `;

    // Toggle price field
    document.getElementById('isFree').addEventListener('change', (e) => {
        document.getElementById('price-field').classList.toggle('hidden', e.target.checked);
    });

    // Mentor form handler
    document.getElementById('mentor-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const isFree = document.getElementById('isFree').checked;
        
        try {
            await db.collection('mentors').doc(currentUser.uid).set({
                userId: currentUser.uid,
                name: currentUserData.name,
                email: currentUserData.email,
                specialty: formData.get('specialty'),
                bio: formData.get('bio'),
                isFree: isFree,
                price: isFree ? 0 : parseFloat(formData.get('price')),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            showNotification('Perfil de mentor salvo com sucesso!');
        } catch (error) {
            showNotification('Erro ao salvar perfil', 'error');
        }
    });

    loadMentorRequests();
}

// Load Mentor Requests
async function loadMentorRequests() {
    const requestsSnapshot = await db.collection('mentorships')
        .where('mentorId', '==', currentUser.uid)
        .get();
    
    const requestsList = document.getElementById('mentor-requests-list');
    
    if (requestsSnapshot.empty) {
        requestsList.innerHTML = '<p class="text-gray-500 text-center">Nenhuma solicitação no momento</p>';
        return;
    }

    requestsList.innerHTML = '';
    requestsSnapshot.forEach(doc => {
        const request = doc.data();
        const div = document.createElement('div');
        div.className = 'border border-gray-200 rounded-lg p-4';
        div.innerHTML = `
            <h4 class="font-semibold">${request.mentoradoName}</h4>
            <p class="text-sm text-gray-600">${request.date} às ${request.time}</p>
            <span class="text-xs px-2 py-1 rounded ${
                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                request.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
            }">${
                request.status === 'pending' ? 'Pendente' :
                request.status === 'confirmed' ? 'Confirmada' :
                'Cancelada'
            }</span>
            ${request.status === 'pending' ? `
                <div class="mt-3 flex space-x-2">
                    <button onclick="respondMentorship('${doc.id}', 'confirmed')" class="flex-1 bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700">Aceitar</button>
                    <button onclick="respondMentorship('${doc.id}', 'cancelled')" class="flex-1 bg-red-600 text-white px-4 py-1 rounded text-sm hover:bg-red-700">Recusar</button>
                </div>
            ` : ''}
        `;
        requestsList.appendChild(div);
    });
}

// Respond to Mentorship
async function respondMentorship(mentorshipId, status) {
    try {
        await db.collection('mentorships').doc(mentorshipId).update({
            status: status
        });
        showNotification(status === 'confirmed' ? 'Mentoria confirmada!' : 'Mentoria recusada');
        loadMentorRequests();
    } catch (error) {
        showNotification('Erro ao responder solicitação', 'error');
    }
}

// Empresa Dashboard
async function loadEmpresaDashboard() {
    const container = document.getElementById('dashboard-empresa');
    
    const companyDoc = await db.collection('companies').doc(currentUser.uid).get();
    const company = companyDoc.data();
    
    container.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 py-8">
            <div class="mb-8">
                <h2 class="text-3xl font-bold mb-2">Dashboard da Empresa</h2>
                <p class="text-gray-600">Plano: <span class="font-semibold text-purple-600">${currentUserData.plan.toUpperCase()}</span></p>
            </div>

            <div class="grid md:grid-cols-2 gap-8">
                <!-- Company Profile -->
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-bold mb-4">Perfil da Empresa</h3>
                    <form id="company-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                            <input type="text" name="companyName" value="${company?.companyName || ''}" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Setor</label>
                            <input type="text" name="sector" value="${company?.sector || ''}" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Sobre a Empresa</label>
                            <textarea name="description" rows="4" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">${company?.description || ''}</textarea>
                        </div>
                        <button type="submit" class="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 font-semibold">Salvar Perfil</button>
                    </form>
                </div>

                <!-- Post Job -->
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-bold mb-4">Publicar Vaga</h3>
                    <form id="job-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Título da Vaga</label>
                            <input type="text" name="title" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                            <textarea name="description" rows="4" required class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Requisitos</label>
                            <textarea name="requirements" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Salário (R$)</label>
                            <input type="number" name="salary" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div class="flex items-center">
                            <input type="checkbox" name="pcdExclusive" id="pcdExclusive" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                            <label for="pcdExclusive" class="ml-2 text-sm font-medium text-gray-700">Vaga exclusiva para PCD</label>
                        </div>
                        <button type="submit" class="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 font-semibold">Publicar Vaga</button>
                    </form>
                </div>
            </div>

            <!-- Talent Search -->
            <div class="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-bold mb-4">Buscar Talentos</h3>
                <div class="mb-4 flex space-x-4">
                    <input type="text" id="search-skills" placeholder="Buscar por habilidades..." class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                    <label class="flex items-center">
                        <input type="checkbox" id="filter-pcd" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                        <span class="ml-2 text-sm font-medium text-gray-700">Apenas PCD</span>
                    </label>
                    <button onclick="searchTalents()" class="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 font-semibold">Buscar</button>
                </div>
                <div id="talents-list" class="space-y-4"></div>
            </div>

            <!-- Posted Jobs -->
            <div class="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-bold mb-4">Vagas Publicadas</h3>
                <div id="jobs-list" class="space-y-4"></div>
            </div>
        </div>
    `;

    // Company form handler
    document.getElementById('company-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            await db.collection('companies').doc(currentUser.uid).set({
                userId: currentUser.uid,
                companyName: formData.get('companyName'),
                sector: formData.get('sector'),
                description: formData.get('description'),
                email: currentUserData.email,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            showNotification('Perfil da empresa salvo com sucesso!');
        } catch (error) {
            showNotification('Erro ao salvar perfil', 'error');
        }
    });

    // Job form handler
    document.getElementById('job-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            await db.collection('jobs').add({
                companyId: currentUser.uid,
                companyName: company?.companyName || currentUserData.name,
                title: formData.get('title'),
                description: formData.get('description'),
                requirements: formData.get('requirements'),
                salary: parseFloat(formData.get('salary')) || 0,
                pcdExclusive: document.getElementById('pcdExclusive').checked,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            showNotification('Vaga publicada com sucesso!');
            e.target.reset();
            loadCompanyJobs();
        } catch (error) {
            showNotification('Erro ao publicar vaga', 'error');
        }
    });

    loadCompanyJobs();
}

// Search Talents
async function searchTalents() {
    const searchSkills = document.getElementById('search-skills').value.toLowerCase();
    const filterPCD = document.getElementById('filter-pcd').checked;
    
    let query = db.collection('profiles');
    
    if (filterPCD) {
        query = query.where('isPCD', '==', true);
    }
    
    const talentsSnapshot = await query.get();
    const talentsList = document.getElementById('talents-list');
    
    if (talentsSnapshot.empty) {
        talentsList.innerHTML = '<p class="text-gray-500 text-center">Nenhum talento encontrado</p>';
        return;
    }

    let filteredTalents = talentsSnapshot.docs;
    
    if (searchSkills) {
        filteredTalents = filteredTalents.filter(doc => {
            const talent = doc.data();
            return talent.skills?.toLowerCase().includes(searchSkills) ||
                   talent.profession?.toLowerCase().includes(searchSkills);
        });
    }

    if (filteredTalents.length === 0) {
        talentsList.innerHTML = '<p class="text-gray-500 text-center">Nenhum talento encontrado com esses critérios</p>';
        return;
    }

    talentsList.innerHTML = '';
    filteredTalents.forEach(doc => {
        const talent = doc.data();
        const div = document.createElement('div');
        div.className = 'border border-gray-200 rounded-lg p-4';
        div.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-semibold text-lg">${talent.name}</h4>
                    <p class="text-sm text-gray-600">${talent.profession || 'Profissão não informada'}</p>
                    <p class="text-sm text-gray-500 mt-1">Experiência: ${talent.experience || 0} anos</p>
                    ${talent.isPCD ? '<span class="inline-block mt-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">PCD</span>' : ''}
                </div>
                <button onclick="viewTalentProfile('${doc.id}')" class="bg-purple-600 text-white px-4 py-1 rounded text-sm hover:bg-purple-700">Ver Perfil</button>
            </div>
            <div class="mt-3">
                <p class="text-sm font-medium text-gray-700">Habilidades:</p>
                <p class="text-sm text-gray-600">${talent.skills || 'Não informado'}</p>
            </div>
        `;
        talentsList.appendChild(div);
    });
}

// View Talent Profile
async function viewTalentProfile(profileId) {
    const profileDoc = await db.collection('profiles').doc(profileId).get();
    const talent = profileDoc.data();
    
    if (!talent) return;
    
    alert(`
Nome: ${talent.name}
Email: ${talent.email}
Telefone: ${talent.phone || 'Não informado'}
Profissão: ${talent.profession || 'Não informado'}
Experiência: ${talent.experience || 0} anos
Habilidades: ${talent.skills || 'Não informado'}
Sobre: ${talent.bio || 'Não informado'}
PCD: ${talent.isPCD ? 'Sim' : 'Não'}
    `);
}

// Load Company Jobs
async function loadCompanyJobs() {
    const jobsSnapshot = await db.collection('jobs')
        .where('companyId', '==', currentUser.uid)
        .get();
    
    const jobsList = document.getElementById('jobs-list');
    
    if (jobsSnapshot.empty) {
        jobsList.innerHTML = '<p class="text-gray-500 text-center">Nenhuma vaga publicada ainda</p>';
        return;
    }

    jobsList.innerHTML = '';
    jobsSnapshot.forEach(doc => {
        const job = doc.data();
        const div = document.createElement('div');
        div.className = 'border border-gray-200 rounded-lg p-4';
        div.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-semibold text-lg">${job.title}</h4>
                    <p class="text-sm text-gray-600 mt-1">${job.description}</p>
                    ${job.salary ? `<p class="text-sm text-green-600 mt-2 font-medium">R$ ${job.salary.toLocaleString('pt-BR')}</p>` : ''}
                    ${job.pcdExclusive ? '<span class="inline-block mt-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Vaga PCD</span>' : ''}
                </div>
                <button onclick="deleteJob('${doc.id}')" class="text-red-600 hover:text-red-800 text-sm">Excluir</button>
            </div>
        `;
        jobsList.appendChild(div);
    });
}

// Delete Job
async function deleteJob(jobId) {
    if (confirm('Deseja realmente excluir esta vaga?')) {
        try {
            await db.collection('jobs').doc(jobId).delete();
            showNotification('Vaga excluída com sucesso!');
            loadCompanyJobs();
        } catch (error) {
            showNotification('Erro ao excluir vaga', 'error');
        }
    }
}

// Initialize
navigateTo('home');
