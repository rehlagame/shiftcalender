// بيانات الدخول الثابتة للتطبيق الشخصي
const ADMIN_USER = "admin";
const ADMIN_PASS = "11223344";

// جلب العناصر من واجهة المستخدم
const loginView = document.getElementById('login-view');
const appView = document.getElementById('app-view');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginError = document.getElementById('login-error');

// التحقق عند تحميل الصفحة: هل المستخدم مسجل دخوله مسبقاً؟
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('shift_app_logged_in');
    if (isLoggedIn === 'true') {
        showApp();
    }
});

// عملية تسجيل الدخول
loginBtn.addEventListener('click', () => {
    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        // بيانات صحيحة
        localStorage.setItem('shift_app_logged_in', 'true');
        loginError.classList.add('hidden');
        showApp();
    } else {
        // بيانات خاطئة
        loginError.classList.remove('hidden');
    }
});

// عملية تسجيل الخروج
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('shift_app_logged_in');
    loginView.classList.remove('hidden');
    appView.classList.add('hidden');

    // مسح الحقول
    usernameInput.value = '';
    passwordInput.value = '';
});

// دالة الانتقال للواجهة الرئيسية وتفعيل التقويم
function showApp() {
    loginView.classList.add('hidden');
    appView.classList.remove('hidden');

    // تشغيل محرك التقويم (هذه الدالة موجودة في calendar.js)
    if(typeof initCalendar === 'function') {
        initCalendar();
    }
}