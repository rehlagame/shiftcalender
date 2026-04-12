// كائن وهمي يمثل قاعدة البيانات (يعتمد على LocalStorage حالياً)
const db = {
    // حفظ تاريخ بداية الدوام
    async saveStartDate(dateString) {
        localStorage.setItem('shift_start_date', dateString);
        return true;
    },

    // استرجاع تاريخ بداية الدوام
    async getStartDate() {
        return localStorage.getItem('shift_start_date');
    },

    // جلب جميع الاستثناءات (مثل الإجازات)
    // الهيكل المُخزن: { "2026-05-15": "vacation", "2026-05-20": "vacation" }
    async getExceptions() {
        const data = localStorage.getItem('shift_exceptions');
        return data ? JSON.parse(data) : {};
    },

    // إضافة استثناء ليوم معين (إجازة)
    async addException(dateString, type) {
        const exceptions = await this.getExceptions();
        exceptions[dateString] = type;
        localStorage.setItem('shift_exceptions', JSON.stringify(exceptions));
        return true;
    },

    // حذف استثناء من يوم معين (العودة للنمط الطبيعي)
    async removeException(dateString) {
        const exceptions = await this.getExceptions();
        if (exceptions[dateString]) {
            delete exceptions[dateString];
            localStorage.setItem('shift_exceptions', JSON.stringify(exceptions));
        }
        return true;
    }
};