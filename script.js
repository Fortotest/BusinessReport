import { marked } from 'marked';
import { GoogleGenerativeAI } from '@google/genai';

// --- GANTI DENGAN KUNCI API ANDA YANG VALID ---
const API_KEY = "AIzaSyDkAVtL00WxWCslXTONGyjpvLNUgySHg64";

// Fungsi untuk format angka dengan titik ribuan
function formatRupiah(angka) {
    if (angka === null || angka === undefined || angka === '') return '';
    let number_string = angka.toString().replace(/[^,\d]/g, ''),
        split = number_string.split(','),
        sisa = split[0].length % 3,
        rupiah = split[0].substr(0, sisa),
        ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
        let separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }
    return rupiah;
}

// Fungsi untuk menghapus format titik dari angka
function unformatRupiah(rupiah_string) {
    if (!rupiah_string || typeof rupiah_string !== 'string') return 0;
    return parseFloat(rupiah_string.replace(/\./g, ''));
}

document.addEventListener('DOMContentLoaded', function() {
    const chartColors = {
        accent: '#007AFF', accentLight: 'rgba(0, 122, 255, 0.2)', text: '#333',
        grid: 'rgba(0, 0, 0, 0.05)', green: '#34C759', orange: '#FF9500',
        purple: '#AF52DE', gray: '#8E8E93', red: '#FF3B30', yellow: '#FFCC00',
        tokopediaColor: '#42b549',
        shopeeColor: '#ee4d2d'
    };

    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.color = chartColors.text;

    // --- LOGIKA NAVIGASI TAB ---
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    function activateTab(targetId) {
        navLinks.forEach(link => link.classList.remove('active'));
        contentSections.forEach(section => section.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[href="#${targetId}"]`);
        const activeSection = document.getElementById(targetId);
        if (activeLink) activeLink.classList.add('active');
        if (activeSection) activeSection.classList.add('active');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            window.location.hash = targetId;
            activateTab(targetId);
        });
    });

    if (window.location.hash) {
        const initialTab = window.location.hash.substring(1);
        activateTab(initialTab);
    } else {
        activateTab('landscape');
    }

    // --- INISIALISASI SEMUA GRAFIK ---
    new Chart(document.getElementById('gmvChart'), {
        type: 'line',
        data: {
            labels: ['Q4 2023', 'Q2 2024', 'Q4 2024', 'Q2 2025 (Est.)'],
            datasets: [{ label: 'GMV (US$ Miliar)', data: [75, 82, 88, 95], borderColor: chartColors.accent, backgroundColor: chartColors.accentLight, fill: true, tension: 0.4 }]
        },
        options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { display: false } }, scales: { y: { border: { display: false } }, x: { border: { display: false } } } }
    });

    new Chart(document.getElementById('marketShareChart'), {
        type: 'doughnut',
        data: {
            labels: ['TikTok-Tokopedia', 'Shopee', 'Lazada', 'Blibli', 'Lainnya'],
            datasets: [{ 
                label: 'Pangsa Pasar GMV', 
                data: [41, 40, 9, 4, 6],
                backgroundColor: [ chartColors.tokopediaColor, chartColors.shopeeColor, chartColors.orange, chartColors.purple, chartColors.gray ], 
                borderColor: '#f8f7f4', borderWidth: 4, hoverOffset: 8 
            }]
        },
        options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { display: true, position: 'bottom', labels: { padding: 15 } } } }
    });
    
    let budgetChart;
    function updateBudgetChart() {
        const budget = unformatRupiah(document.getElementById('marketingBudget').value) || 0;
        const allocations = { video: budget * 0.4, kol: budget * 0.3, promo: budget * 0.2, other: budget * 0.1 };
        const budgetChartEl = document.getElementById('budgetChart');
        if (!budgetChartEl) return;
        if (budgetChart) {
            budgetChart.data.datasets[0].data = Object.values(allocations);
            budgetChart.update();
        } else {
            budgetChart = new Chart(budgetChartEl, {
                type: 'pie',
                data: {
                    labels: ['Video Content & Ads', 'KOL & Afiliasi', 'Promosi & Diskon', 'Lainnya'],
                    datasets: [{ data: Object.values(allocations), backgroundColor: [chartColors.accent, chartColors.green, chartColors.orange, chartColors.gray] }]
                },
                options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { display: true, position: 'bottom' } } }
            });
        }
    }
    const marketingBudgetEl = document.getElementById('marketingBudget');
    if(marketingBudgetEl) { marketingBudgetEl.addEventListener('input', updateBudgetChart); }
    updateBudgetChart();

    new Chart(document.getElementById('sentimentChart'), {
        type: 'bar',
        data: {
            labels: ['Harga', 'Kualitas', 'Keaslian', 'Pengiriman'],
            datasets: [
                { label: 'Positif', data: [40, 75, 85, 55], backgroundColor: chartColors.green },
                { label: 'Netral', data: [30, 15, 10, 20], backgroundColor: chartColors.gray },
                { label: 'Negatif', data: [30, 10, 5, 25], backgroundColor: chartColors.red },
            ]
        },
        options: { maintainAspectRatio: false, responsive: true, scales: { x: { stacked: true }, y: { stacked: true } }, plugins: { legend: { display: false } } }
    });
    
    const competitorData = [
        { x: 3, y: 3, label: 'Hanasui', info: '<strong>Hanasui:</strong> Pemain volume dengan harga sangat kompetitif. Kuat di segmen pemula.' },
        { x: 5, y: 6, label: 'Wardah', info: '<strong>Wardah:</strong> Brand lokal raksasa dengan kepercayaan tinggi dan jangkauan luas. Harga terjangkau dengan kualitas terjamin.' },
        { x: 6, y: 5, label: 'Glad2Glow', info: '<strong>Glad2Glow:</strong> Viral di TikTok dengan harga agresif dan kemasan menarik. Fokus pada tren.' },
        { x: 8, y: 8, label: 'Skintific', info: '<strong>Skintific:</strong> Pemimpin pasar dengan fokus pada formulasi berbasis sains dan branding premium (masstige).' }
    ];
    new Chart(document.getElementById('competitorMap'), {
        type: 'scatter',
        data: {
            datasets: [{ label: 'Kompetitor Skincare', data: competitorData, backgroundColor: chartColors.accent, pointRadius: 8, pointHoverRadius: 10 }]
        },
        options: {
            maintainAspectRatio: false, responsive: true,
            scales: {
                x: { title: { display: true, text: 'Harga (Relatif Rendah ke Tinggi)' } },
                y: { title: { display: true, text: 'Kualitas & Inovasi (Persepsi)' } }
            },
             plugins: { legend: { display: false } },
            onClick: (e, elements) => {
                if (elements.length > 0) {
                    document.getElementById('competitorInfo').innerHTML = competitorData[elements[0].index].info;
                }
            }
        }
    });

    // --- LOGIKA KALKULATOR & LAB STRATEGI ---
    const labSection = document
