import { marked } from 'marked';
import { GoogleGenerativeAI } from '@google/genai';

// --- KUNCI API ANDA SUDAH DIMASUKKAN DI SINI ---
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
    const labSection = document.getElementById('lab');
    const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

    function calculateAll() {
        const hargaJual = unformatRupiah(document.getElementById('hargaJual').value);
        const hpp = unformatRupiah(document.getElementById('hpp').value);
        const biayaIklan = unformatRupiah(document.getElementById('biayaIklan').value);
        const fixedCosts = unformatRupiah(document.getElementById('fixedCosts').value);
        const avgPurchaseValue = unformatRupiah(document.getElementById('avgPurchaseValue').value);
        const biayaPlatformPersen = parseFloat(document.getElementById('biayaPlatform').value) || 0;
        const avgSales = parseFloat(document.getElementById('avgSales').value) || 0;
        const purchaseFrequency = parseFloat(document.getElementById('purchaseFrequency').value) || 0;
        const customerLifespan = parseFloat(document.getElementById('customerLifespan').value) || 0;
        
        const biayaPlatform = hargaJual * (biayaPlatformPersen / 100);
        const marginPerUnit = hargaJual - hpp - biayaIklan - biayaPlatform;
        const netMargin = hargaJual > 0 ? (marginPerUnit / hargaJual) * 100 : 0;
        const bepUnits = marginPerUnit > 0 ? Math.ceil(fixedCosts / marginPerUnit) : 0;
        const annualRevenue = avgSales * hargaJual * 12;
        const annualProfit = (avgSales * marginPerUnit * 12) - (fixedCosts * 12);
        const ltv = avgPurchaseValue * purchaseFrequency * customerLifespan;
        const totalAdSpend = biayaIklan * avgSales * 12;
        const roas = totalAdSpend > 0 ? annualRevenue / totalAdSpend : 0;

        document.getElementById('netMargin').textContent = `${netMargin.toFixed(1)}%`;
        document.getElementById('netMargin').style.color = netMargin >= 0 ? chartColors.green : chartColors.red;
        document.getElementById('bepResult').innerHTML = `Anda perlu menjual <span class="text-2xl accent-color">${bepUnits.toLocaleString('id-ID')}</span> unit/bulan untuk BEP.`;
        document.getElementById('revenueResult').innerHTML = `Proyeksi Pendapatan Tahunan: <br><span class="text-2xl accent-color">${formatter.format(annualRevenue)}</span>`;
        document.getElementById('ltvResult').innerHTML = `Estimasi LTV per Pelanggan: <br><span class="text-2xl accent-color">${formatter.format(ltv)}</span>`;
        document.getElementById('finalRevenue').textContent = formatter.format(annualRevenue);
        document.getElementById('finalProfit').textContent = formatter.format(annualProfit);
        document.getElementById('finalROAS').textContent = `${roas.toFixed(2)}x`;
        document.getElementById('finalProfit').style.color = annualProfit >= 0 ? chartColors.green : chartColors.red;

        const verdictEl = document.getElementById('strategicVerdict');
        if (netMargin > 20 && roas > 5) {
            verdictEl.innerHTML = `<strong class="text-green-600">Sangat Solid.</strong> Profitabilitas sehat dan ROAS kuat. Ini adalah rencana untuk dominasi pasar.`;
        } else if (netMargin > 10 && roas > 3) {
            verdictEl.innerHTML = `<strong class="text-yellow-600">Potensial.</strong> Model bisnis ini bisa berjalan, tapi perlu optimalisasi biaya iklan dan operasional.`;
        } else if (annualRevenue > 0) {
            verdictEl.innerHTML = `<strong class="text-red-600">Peringatan Kritis.</strong> Margin tipis dan ROAS rendah, ini adalah resep bakar uang. Bongkar total struktur harga dan biaya Anda.`;
        } else {
            verdictEl.innerHTML = `Masukkan data di Laboratorium Strategi untuk melihat analisis akhir.`;
        }
    }
    
    const rupiahInputs = ['hargaJual', 'hpp', 'biayaIklan', 'fixedCosts', 'avgPurchaseValue', 'marketingBudget', 'ai-harga-jual', 'ai-hpp', 'ai-biaya-lain'];
    rupiahInputs.forEach(id => {
        const inputElement = document.getElementById(id);
        if (inputElement) {
            inputElement.addEventListener('keyup', function(e) { this.value = formatRupiah(this.value); });
        }
    });

    if (labSection) { labSection.addEventListener('input', calculateAll); }
    
    const businessModelForm = document.getElementById('businessModelForm');
    if (businessModelForm) {
        businessModelForm.addEventListener('change', () => {
            const margin = businessModelForm.querySelector('input[name="margin"]:checked')?.value;
            const branding = businessModelForm.querySelector('input[name="branding"]:checked')?.value;
            const resultEl = document.getElementById('businessModelResult');
            if (margin && branding) {
                if (margin === 'high' && branding === 'strong') { resultEl.innerHTML = `<span class="text-green-600">Rekomendasi: Jalur B (Nilai).</span> Fokus pada Lazada/Blibli.`; }
                else if (margin === 'low' && branding === 'new') { resultEl.innerHTML = `<span class="accent-color">Rekomendasi: Jalur A (Volume).</span> Fokus pada TikTok-Tokopedia/Shopee.`; }
                else { resultEl.innerHTML = `<span class="text-orange-500">Hybrid.</span> Perlu strategi cerdas di kedua jalur.`; }
            }
        });
    }

    const opportunityForm = document.getElementById('opportunityForm');
    if (opportunityForm) {
        opportunityForm.addEventListener('input', () => {
            const branding = parseInt(document.getElementById('brandingScore').value);
            const agility = parseInt(document.getElementById('agilityScore').value);
            const marketing = parseInt(document.getElementById('marketingScore').value);
            const score = Math.round(((branding * 4) + (agility * 3) + (marketing * 3)));
            document.getElementById('opportunityResult').textContent = `${score * 10}/100`;
        });
    }
    
    const checklist = document.getElementById('readinessChecklist');
    if (checklist) {
        checklist.addEventListener('change', () => {
            const checkboxes = checklist.querySelectorAll('input[type="checkbox"]');
            const checked = checklist.querySelectorAll('input[type="checkbox"]:checked');
            const percentage = (checked.length / checkboxes.length) * 100;
            document.getElementById('readinessProgress').style.width = `${percentage}%`;
            document.getElementById('readinessText').textContent = `Tingkat Kesiapan: ${Math.round(percentage)}%`;
        });
    }

    calculateAll();

    // --- LOGIKA AI ANALYST ---
    const analyzeButton = document.getElementById('analyze-button');
    const outputDiv = document.getElementById('ai-analysis-output');
    if (analyzeButton) {
        analyzeButton.addEventListener('click', async () => {
            if (!API_KEY || API_KEY.includes("GANTI_DENGAN")) {
                outputDiv.innerHTML = `<p class="text-red-500 font-bold">Error: API Key tidak dimasukkan dengan benar.</p>`;
                return;
            }
            const namaProduk = document.getElementById('ai-nama-produk').value;
            const hargaJual = unformatRupiah(document.getElementById('ai-harga-jual').value);
            const terjualBulanan = parseFloat(document.getElementById('ai-terjual-bulanan').value);
            const hpp = unformatRupiah(document.getElementById('ai-hpp').value);
            const biayaLain = unformatRupiah(document.getElementById('ai-biaya-lain').value);
            const strategi = document.getElementById('ai-strategi').value;
            if (!namaProduk || !hargaJual || !terjualBulanan || !hpp || !biayaLain) {
                outputDiv.innerHTML = `<p class="text-orange-500 font-bold">Harap isi semua kolom data produk.</p>`;
                return;
            }
            outputDiv.innerHTML = `<p class="text-gray-500 animate-pulse">Menganalisis data dengan AI...</p>`;
            analyzeButton.disabled = true;
            analyzeButton.classList.add('opacity-50', 'cursor-not-allowed');
            
            const prompt = `
            Persona:
            You are a brutally intelligent financial and marketing strategist AI... (Sisa prompt dengan karakter beringas ada di sini)
            `;

            try {
                const genAI = new GoogleGenerativeAI(API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                if (text) {
                    outputDiv.innerHTML = await marked.parse(text);
                } else {
                    outputDiv.innerHTML = `<p class="text-orange-500 font-bold">AI tidak memberikan respons.</p>`;
                }
            } catch (err) {
                console.error("AI Analysis Failed:", err);
                outputDiv.innerHTML = `<p class="text-red-500 font-bold">Gagal menghubungi AI. Periksa konsol dan API Key Anda.</p>`;
            } finally {
                analyzeButton.disabled = false;
                analyzeButton.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        });
    }
});
