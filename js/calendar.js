// --- المتغيرات الرئيسية وحالة التطبيق ---
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// نمط الدورة المطور: 10 أيام (مجموعة ملونة -> راحة -> مجموعة خضراء -> راحة)
const shiftPattern = [
    // المجموعة الأولى (ألوان مختلفة)
    { id: 'morning', label: 'صبح', class: 'shift-morning' },
    { id: 'evening', label: 'عصر', class: 'shift-evening' },
    { id: 'night', label: 'ليل', class: 'shift-night' },
    { id: 'off', label: 'راحة', class: 'shift-off' },
    { id: 'off', label: 'راحة', class: 'shift-off' },
    // المجموعة الثانية (أخضر فاتح)
    { id: 'morning2', label: 'صبح', class: 'shift-group2' },
    { id: 'evening2', label: 'عصر', class: 'shift-group2' },
    { id: 'night2', label: 'ليل', class: 'shift-group2' },
    { id: 'off2', label: 'راحة', class: 'shift-off' },
    { id: 'off2', label: 'راحة', class: 'shift-off' }
];

// --- عناصر الواجهة للتقويم ---
const monthYearDisplay = document.getElementById('month-year-display');
const calendarGrid = document.getElementById('calendar-grid');
const startDateInput = document.getElementById('start-date-input');
const settingsPanel = document.getElementById('settings-panel');
const modal = document.getElementById('exception-modal');
let selectedDateForModal = null;

// --- دالة التهيئة المبدئية ---
async function initCalendar() {
    const savedStartDate = await db.getStartDate();
    if (savedStartDate) {
        startDateInput.value = savedStartDate;
    } else {
        settingsPanel.classList.remove('hidden');
    }
    renderCalendar(currentMonth, currentYear);
}

// --- الدالة الأساسية لرسم التقويم ---
async function renderCalendar(month, year) {
    calendarGrid.innerHTML = '';

    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    monthYearDisplay.innerText = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const startDateString = await db.getStartDate();
    const exceptions = await db.getExceptions();

    // إصلاح مشكلة التوقيت: تفكيك النص يدوياً لإنشاء تاريخ محلي بحت
    let startDateObj = null;
    if (startDateString) {
        const p = startDateString.split('-');
        startDateObj = new Date(p[0], p[1] - 1, p[2]); // السنة، الشهر (0-11)، اليوم
    }

    // إضافة هذا السطر لجلب التاريخ الفعلي لليوم
    const realToday = new Date();

    // 1. إضافة المربعات الفارغة
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day-cell', 'empty-cell');
        calendarGrid.appendChild(emptyCell);
    }

    // 2. توليد أيام الشهر الفعلي
    for (let day = 1; day <= daysInMonth; day++) {
        const cellDate = new Date(year, month, day);
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const cell = document.createElement('div');
        cell.classList.add('day-cell');
        cell.innerHTML = `<div class="day-number">${day}</div>`;

        cell.addEventListener('click', () => openModal(dateStr, monthNames[month], day, year));

        // --- التعديل هنا: التحقق مما إذا كان هذا المربع هو "اليوم الحالي" ---
        if (year === realToday.getFullYear() && month === realToday.getMonth() && day === realToday.getDate()) {
            cell.classList.add('today-cell');
        }

        if (exceptions[dateStr] === 'vacation') {
            cell.classList.add('shift-vacation');
            cell.innerHTML += `<div class="shift-name">إجازة</div>`;
        }
        else if (startDateObj) {
            // حساب الفرق باستخدام UTC لضمان دقة الأيام وعدم تأثرها بالساعات أو التوقيت الصيفي
            const utcCell = Date.UTC(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
            const utcStart = Date.UTC(startDateObj.getFullYear(), startDateObj.getMonth(), startDateObj.getDate());

            const diffDays = Math.round((utcCell - utcStart) / (1000 * 60 * 60 * 24));

            // تطبيق النمط المكون من 10 أيام
            const shiftIndex = ((diffDays % 10) + 10) % 10;
            const todayShift = shiftPattern[shiftIndex];

            cell.classList.add(todayShift.class);
            cell.innerHTML += `<div class="shift-name">${todayShift.label}</div>`;
        }

        calendarGrid.appendChild(cell);
    }
}

// --- أحداث التفاعل ---
document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar(currentMonth, currentYear);
});

document.getElementById('next-month').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar(currentMonth, currentYear);
});

document.getElementById('settings-toggle-btn').addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
});

document.getElementById('save-settings-btn').addEventListener('click', async () => {
    const newDate = startDateInput.value;
    if (newDate) {
        await db.saveStartDate(newDate);
        settingsPanel.classList.add('hidden');
        renderCalendar(currentMonth, currentYear);
    } else {
        alert("الرجاء اختيار تاريخ أولاً!");
    }
});

function openModal(dateStr, monthName, day, year) {
    selectedDateForModal = dateStr;
    document.getElementById('modal-date-title').innerText = `${day} ${monthName} ${year}`;
    modal.classList.remove('hidden');
}

document.getElementById('close-modal-btn').addEventListener('click', () => {
    modal.classList.add('hidden');
});

document.getElementById('mark-vacation-btn').addEventListener('click', async () => {
    if (selectedDateForModal) {
        await db.addException(selectedDateForModal, 'vacation');
        modal.classList.add('hidden');
        renderCalendar(currentMonth, currentYear);
    }
});

document.getElementById('clear-exception-btn').addEventListener('click', async () => {
    if (selectedDateForModal) {
        await db.removeException(selectedDateForModal);
        modal.classList.add('hidden');
        renderCalendar(currentMonth, currentYear);
    }
});
