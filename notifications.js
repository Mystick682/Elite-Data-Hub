// Elite Notification Engine
const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
toastContainer.className = 'fixed top-5 right-5 z-[1000] flex flex-col gap-3 pointer-events-none';
document.body.appendChild(toastContainer);

window.showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    
    // Style based on type
    const bgColor = type === 'success' ? 'bg-white' : 'bg-red-50';
    const borderColor = type === 'success' ? 'border-green-100' : 'border-red-100';
    const iconColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? '✓' : '✕';

    toast.className = `
        flex items-center p-4 pr-8 rounded-2xl shadow-2xl border ${bgColor} ${borderColor}
        transform translate-x-full transition-all duration-500 ease-out pointer-events-auto
        min-w-[300px] max-w-md
    `;

    toast.innerHTML = `
        <div class="w-10 h-10 ${iconColor} rounded-full flex items-center justify-center text-white font-bold shrink-0 mr-4 shadow-lg shadow-blue-500/10">
            ${icon}
        </div>
        <div class="flex flex-col">
            <p class="text-[13px] font-black text-[#081B4B] uppercase tracking-tight">${type === 'success' ? 'Success' : 'Attention'}</p>
            <p class="text-slate-500 text-xs font-medium">${message}</p>
        </div>
    `;

    toastContainer.appendChild(toast);

    // Animate In
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
};