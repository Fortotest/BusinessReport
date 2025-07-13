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

    // --- LOGIKA MENU MOBILE & NAVIGASI TAB ---
    const menuButton = document.getElementById('menu-button');
    const navLinksContainer = document.getElementById('nav-links');
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');

    menuButton.addEventListener('click', () => {
        navLinksContainer.classList.toggle('hidden');
    });
    
    function activateTab(targetId) {
        navLinks.forEach(link => link.classList.remove('active'));
        contentSections.forEach(section => section.classList.remove('active'));
        
        const activeLink = document.querySelector(`.nav-link[href="#${targetId}"]`);
        const activeSection = document.getElementById(targetId);
        
        if (activeLink) activeLink.classList.add('active');
        if (activeSection) activeSection.classList.add('active');
        
        // Sembunyikan menu setelah link di-klik di mobile
        if (window.innerWidth < 768) {
            navLinksContainer.classList.add('hidden');
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            window.location.hash = targetId;
            activateTab(targetId);
        });
    });

    // Aktivasi tab berdasarkan URL hash saat pertama kali load
    if (window.location.hash) {
        activateTab(window.location.hash.substring(1));
    } else {
        activateTab('landscape');
    }

    // --- INISIALISASI SEMUA GRAFIK ---
    new Chart(document.getElementById('gmvChart'), { type: 'line', data: { labels: ['Q4 2023', 'Q2 2024', 'Q4 2024', 'Q2 2025 (Est.)'], datasets: [{ label: 'GMV (US$ Miliar)', data: [75, 82, 88, 95], borderColor: chartColors.accent, backgroundColor: chartColors.accentLight, fill: true, tension: 0.4 }] }, options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { display: false } }, scales: { y: { border: { display: false } }, x: { border: { display: false } } } } });
    new Chart(document.getElementById('marketShareChart'), { type: 'doughnut', data: { labels: ['TikTok-Tokopedia', 'Shopee', 'Lazada', 'Blibli', 'Lainnya'], datasets: [{ label: 'Pangsa Pasar GMV', data: [41, 40, 9, 4, 6], backgroundColor: [ chartColors.tokopediaColor, chartColors.shopeeColor, chartColors.orange, chartColors.purple, chartColors.gray ], borderColor: '#f8f7f4', borderWidth: 4, hoverOffset: 8 }] }, options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { display: true, position: 'bottom', labels: { padding: 15 } } } } });
    
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
            budgetChart = new Chart(budgetChartEl, { type: 'pie', data: { labels: ['Video & Ads', 'KOL/Afiliasi', 'Promosi', 'Lainnya'], datasets: [{ data: Object.values(allocations), backgroundColor: [chartColors.accent, chartColors.green, chartColors.orange, chartColors.gray] }] }, options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { display: true, position: 'bottom' } } } });
        }
    }
    document.getElementById('marketingBudget').addEventListener('input', updateBudgetChart);
    updateBudgetChart();

    new Chart(document.getElementById('sentimentChart'), { type: 'bar', data: { labels: ['Harga', 'Kualitas', 'Keaslian', 'Pengiriman'], datasets: [ { label: 'Positif', data: [40, 75, 85, 55], backgroundColor: chartColors.green }, { label: 'Netral', data: [30, 15, 10, 20], backgroundColor: chartColors.gray }, { label: 'Negatif', data: [30, 10, 5, 25], backgroundColor: chartColors.red }, ] }, options: { maintainAspectRatio: false, responsive: true, scales: { x: { stacked: true }, y: { stacked: true } }, plugins: { legend: { display: false } } } });
    const competitorData = [ { x: 3, y: 3, label: 'Hanasui', info: '<strong>Hanasui:</strong> Pemain volume, harga kompetitif.' }, { x: 5, y: 6, label: 'Wardah', info: '<strong>Wardah:</strong> Brand raksasa, kepercayaan tinggi.' }, { x: 6, y: 5, label: 'Glad2Glow', info: '<strong>Glad2Glow:</strong> Viral, harga agresif.' }, { x: 8, y: 8, label: 'Skintific', info: '<strong>Skintific:</strong> Pemimpin pasar, branding premium.' } ];
    new Chart(document.getElementById('competitorMap'), { type: 'scatter', data: { datasets: [{ label: 'Kompetitor Skincare', data: competitorData, backgroundColor: chartColors.accent, pointRadius: 8, pointHoverRadius: 10 }] }, options: { maintainAspectRatio: false, responsive: true, scales: { x: { title: { display: true, text: 'Harga' } }, y: { title: { display: true, text: 'Kualitas' } } }, plugins: { legend: { display: false } }, onClick: (e, elements) => { if (elements.length > 0) { document.getElementById('competitorInfo').innerHTML = competitorData[elements[0].index].info; } } } });
    
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
        document.getElementById('bepResult').innerHTML = `Jual <span class="text-2xl accent-color">${bepUnits.toLocaleString('id-ID')}</span> unit/bulan untuk BEP.`;
        document.getElementById('revenueResult').innerHTML = `Proyeksi Pendapatan Tahunan: <br><span class="text-2xl accent-color">${formatter.format(annualRevenue)}</span>`;
        document.getElementById('ltvResult').innerHTML = `Estimasi LTV per Pelanggan: <br><span class="text-2xl accent-color">${formatter.format(ltv)}</span>`;
        document.getElementById('finalRevenue').textContent = formatter.format(annualRevenue);
        document.getElementById('finalProfit').textContent = formatter.format(annualProfit);
        document.getElementById('finalROAS').textContent = `${roas.toFixed(2)}x`;
        document.getElementById('finalProfit').style.color = annualProfit >= 0 ? chartColors.green : chartColors.red;

        const verdictEl = document.getElementById('strategicVerdict');
        if (netMargin > 20 && roas > 5) { verdictEl.innerHTML = `<strong class="text-green-600">Sangat Solid.</strong> Profitabilitas sehat dan ROAS kuat.`; } 
        else if (netMargin > 10 && roas > 3) { verdictEl.innerHTML = `<strong class="text-yellow-600">Potensial.</strong> Perlu optimalisasi biaya iklan dan operasional.`; } 
        else if (annualRevenue > 0) { verdictEl.innerHTML = `<strong class="text-red-600">Peringatan Kritis.</strong> Margin tipis dan ROAS rendah, resep bakar uang.`; } 
        else { verdictEl.innerHTML = `Masukkan data di Laboratorium Strategi untuk melihat analisis akhir.`; }
    }
    
    const rupiahInputs = ['hargaJual', 'hpp', 'biayaIklan', 'fixedCosts', 'avgPurchaseValue', 'marketingBudget', 'ai-harga-jual', 'ai-hpp', 'ai-biaya-lain'];
    rupiahInputs.forEach(id => {
        const inputElement = document.getElementById(id);
        if (inputElement) { inputElement.addEventListener('keyup', function(e) { this.value = formatRupiah(this.value); }); }
    });

    if (labSection) { labSection.addEventListener('input', calculateAll); }
    
    document.getElementById('businessModelForm').addEventListener('change', () => {
        const margin = document.querySelector('input[name="margin"]:checked')?.value;
        const branding = document.querySelector('input[name="branding"]:checked')?.value;
        const resultEl = document.getElementById('businessModelResult');
        if (margin && branding) {
            if (margin === 'high' && branding === 'strong') { resultEl.innerHTML = `<span class="text-green-600">Rekomendasi: Jalur B (Nilai).</span>`; }
            else if (margin === 'low' && branding === 'new') { resultEl.innerHTML = `<span class="accent-color">Rekomendasi: Jalur A (Volume).</span>`; }
            else { resultEl.innerHTML = `<span class="text-orange-500">Hybrid.</span> Perlu strategi cerdas.`; }
        }
    });

    document.getElementById('opportunityForm').addEventListener('input', () => {
        const branding = parseInt(document.getElementById('brandingScore').value);
        const agility = parseInt(document.getElementById('agilityScore').value);
        const marketing = parseInt(document.getElementById('marketingScore').value);
        const score = Math.round(((branding * 4) + (agility * 3) + (marketing * 3)));
        document.getElementById('opportunityResult').textContent = `${score * 10}`;
    });
    
    document.getElementById('readinessChecklist').addEventListener('change', () => {
        const checkboxes = document.querySelectorAll('#readinessChecklist input[type="checkbox"]');
        const checked = document.querySelectorAll('#readinessChecklist input[type="checkbox"]:checked');
        const percentage = (checked.length / checkboxes.length) * 100;
        document.getElementById('readinessProgress').style.width = `${percentage}%`;
        document.getElementById('readinessText').textContent = `Tingkat Kesiapan: ${Math.round(percentage)}%`;
    });

    calculateAll();

    // --- LOGIKA AI ANALYST TERINTEGRASI ---
    const analyzeButton = document.getElementById('analyze-button');
    const outputDiv = document.getElementById('ai-analysis-output');
    if (analyzeButton) {
        analyzeButton.addEventListener('click', async () => {
            if (!API_KEY || API_KEY.includes("GANTI_DENGAN")) {
                outputDiv.innerHTML = `<p class="text-red-500 font-bold">Error: API Key tidak valid.</p>`;
                return;
            }

            const labNetMargin = document.getElementById('netMargin').textContent;
            const labBep = document.getElementById('bepResult').innerText;
            const labLtv = document.getElementById('ltvResult').innerText.replace('Estimasi LTV per Pelanggan: ', '');
            
            const namaProduk = document.getElementById('ai-nama-produk').value;
            const hargaJual = unformatRupiah(document.getElementById('ai-harga-jual').value);
            const terjualBulanan = parseFloat(document.getElementById('ai-terjual-bulanan').value);
            const hpp = unformatRupiah(document.getElementById('ai-hpp').value);
            const biayaLain = unformatRupiah(document.getElementById('ai-biaya-lain').value);
            const strategi = document.getElementById('ai-strategi').value;
            
            if (!namaProduk) {
                outputDiv.innerHTML = `<p class="text-orange-500 font-bold">Nama Produk di form AI Analyst wajib diisi.</p>`;
                return;
            }

            outputDiv.innerHTML = `<p class="text-gray-500 animate-pulse">Menganalisis data secara terintegrasi...</p>`;
            analyzeButton.disabled = true;
            analyzeButton.classList.add('opacity-50', 'cursor-not-allowed');
            
            const prompt = `
            Tugas: Lo adalah seorang analis strategi e-commerce yang beringas. Analisis dossier bisnis berikut dan berikan laporan tajam.

            ---
            **DOSSIER BISNIS LENGKAP:**

            **BAGIAN A: KONDISI PASAR MAKRO 2025**
            - Arena Kompetisi: Duopoli ketat antara TikTok-Tokopedia vs. Shopee.

            **BAGIAN B: SIMULASI INTERNAL BISNIS (Dari Kalkulator Dasbor)**
            - Proyeksi Net Profit Margin: ${labNetMargin}
            - Kebutuhan Break-Even Point: ${labBep}
            - Estimasi LTV per Pelanggan: ${labLtv}

            **BAGIAN C: ANALISIS PRODUK SPESIFIK (Input Manual)**
            - Nama Produk: ${namaProduk}
            - Harga Jual: Rp ${parseFloat(hargaJual).toLocaleString('id-ID')}
            - Terjual/Bulan: ${parseFloat(terjualBulanan).toLocaleString('id-ID')} unit
            - HPP/Unit: Rp ${parseFloat(hpp).toLocaleString('id-ID')}
            - Biaya Lain/Unit: Rp ${parseFloat(biayaLain).toLocaleString('id-ID')}
            - Klaim Strategi Marketing: ${strategi || "Tidak disebutkan"}

            ---
            **LAPORAN STRATEGIS TERINTEGRASI LO:**
            Berdasarkan **semua data** di atas, buat laporan dengan format berikut:

            ### 1. Diagnosis Brutal
            Sintesiskan semua data. Bisnis ini sehat, sekarat, atau cuma halu? Bandingkan simulasi internal lo (Bagian B) dengan data produk spesifik (Bagian C). Ada yang janggal?

            ### 2. Sinkronisasi Strategi vs. Pasar
            Apakah model bisnis dan margin yang lo simulasikan di lab cocok dengan kondisi pasar yang lagi perang harga? Kalau enggak, lo salah di mana?

            ### 3. Perintah Eksekusi Terintegrasi
            Berikan perintah yang jelas, bukan saran ngambang.
            - **URGENT:** Apa yang harus dihentikan SEKARANG JUGA?
            - **STRATEGIS:** Pilih Jalur A (Volume) atau Jalur B (Nilai)? Putuskan berdasarkan data, bukan perasaan. Beri alasan kenapa.
            - **MARKETING:** Rekomendasi marketing apa yang paling masuk akal, mengingat LTV dan kondisi pasar?
            
            ---
            **ATURAN MAIN:**
            - **Karakter:** Brutal, cerdas, tanpa basa-basi. CFO yang benci omong kosong.
            - **Bahasa:** "Lo-gue", sarkasme tajam. Istilah teknis dalam Bahasa Inggris (CAC, ROAS, LTV, margin).
            - **Format:** Gunakan Markdown (###, bullet points). Akhiri dengan pertanyaan menantang.
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
                outputDiv.innerHTML = `<p class="text-red-500 font-bold">Gagal menghubungi AI. Cek konsol dan API Key.</p><p class="text-xs text-gray-500">${err}</p>`;
            } finally {
                analyzeButton.disabled = false;
                analyzeButton.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        });
    }
});
