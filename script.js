import { marked } from 'marked';
import { GoogleGenerativeAI } from '@google/genai';

// --- API Key Anda sudah dimasukkan di sini ---
const API_KEY = "AIzaSyDkAVtL00WxWCslXTONGyjpvLNUgySHg64";

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

    // --- INISIALISASI GRAFIK ---
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

    // --- LOGIKA KALKULATOR & LAB STRATEGI ---
    const labSection = document.getElementById('lab');
    const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

    function calculateAll() {
        const hargaJual = parseFloat(document.getElementById('hargaJual').value) || 0;
        const hpp = parseFloat(document.getElementById('hpp').value) || 0;
        const biayaIklan = parseFloat(document.getElementById('biayaIklan').value) || 0;
        const biayaPlatformPersen = parseFloat(document.getElementById('biayaPlatform').value) || 0;
        const fixedCosts = parseFloat(document.getElementById('fixedCosts').value) || 0;
        const avgSales = parseFloat(document.getElementById('avgSales').value) || 0;
        const avgPurchaseValue = parseFloat(document.getElementById('avgPurchaseValue').value) || 0;
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
            verdictEl.innerHTML = `<strong class="text-green-600">Sangat Solid.</strong> Profitabilitas sehat dan ROAS kuat. Ini adalah rencana untuk dominasi pasar. Fokus sekarang adalah eksekusi tanpa cela dan skalabilitas.`;
        } else if (netMargin > 10 && roas > 3) {
            verdictEl.innerHTML = `<strong class="text-yellow-600">Potensial.</strong> Model bisnis ini bisa berjalan, tapi bocor di beberapa sisi. Optimalkan biaya iklan dan operasional sekarang juga untuk mengubah potensi menjadi profit nyata.`;
        } else if (annualRevenue > 0) {
            verdictEl.innerHTML = `<strong class="text-red-600">Peringatan Kritis.</strong> Ini bukan bisnis, ini kegiatan bakar uang. Margin tipis dan ROAS rendah adalah resep menuju kebangkrutan. Bongkar total struktur harga dan biaya Anda. Segera.`;
        } else {
            verdictEl.innerHTML = `Masukkan data di Laboratorium Strategi untuk melihat analisis akhir. Rencana Anda akan dievaluasi di sini berdasarkan potensi profitabilitas, skalabilitas, dan efisiensi pemasaran.`;
        }
    }
    
    if (labSection) {
        labSection.addEventListener('input', calculateAll);
    }
    
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

    // (Kode lain untuk chart dan checklist ada di sini...)

    calculateAll();

    // --- LOGIKA AI ANALYST ---
    const analyzeButton = document.getElementById('analyze-button');
    const outputDiv = document.getElementById('ai-analysis-output');
    if (analyzeButton) {
        analyzeButton.addEventListener('click', async () => {
            if (!API_KEY || API_KEY === "GANTI_DENGAN_API_KEY_ASLI_ANDA") {
                outputDiv.innerHTML = `<p class="text-red-500 font-bold">Error: API_KEY tidak dikonfigurasi. Harap masukkan API Key Anda yang valid di dalam kode.</p>`;
                return;
            }
            const namaProduk = document.getElementById('ai-nama-produk').value;
            const hargaJual = document.getElementById('ai-harga-jual').value;
            const terjualBulanan = document.getElementById('ai-terjual-bulanan').value;
            const hpp = document.getElementById('ai-hpp').value;
            const biayaLain = document.getElementById('ai-biaya-lain').value;
            const strategi = document.getElementById('ai-strategi').value;
            if (!namaProduk || !hargaJual || !terjualBulanan || !hpp || !biayaLain) {
                outputDiv.innerHTML = `<p class="text-orange-500 font-bold">Harap isi semua kolom data produk untuk analisis yang akurat.</p>`;
                return;
            }
            outputDiv.innerHTML = `<p class="text-gray-500 animate-pulse">Menganalisis data dengan AI... Ini mungkin membutuhkan beberapa saat.</p>`;
            analyzeButton.disabled = true;
            analyzeButton.classList.add('opacity-50', 'cursor-not-allowed');
            const prompt = `
            Anda adalah seorang analis bisnis e-commerce ahli di Indonesia. Analisis Anda tajam, berdasarkan data, dan menggunakan terminologi bisnis digital yang umum di Indonesia. Jangan mengarang, berikan analisis logis berdasarkan data yang diberikan.
            Berikut adalah data dari produk yang dijual di marketplace Indonesia:
            - Nama Produk: ${namaProduk}
            - Harga Jual: Rp ${parseFloat(hargaJual).toLocaleString('id-ID')}
            - Jumlah Terjual per bulan: ${parseFloat(terjualBulanan).toLocaleString('id-ID')} unit
            - Biaya Produksi per unit (HPP): Rp ${parseFloat(hpp).toLocaleString('id-ID')}
            - Biaya Lain per unit (Logistik, Admin, Iklan): Rp ${parseFloat(biayaLain).toLocaleString('id-ID')}
            - Strategi Marketing yang digunakan seller: ${strategi || "Tidak disebutkan"}
            TOLONG BUAT LAPORAN ANALISIS MENDALAM:
            1.  **Analisis Profitabilitas:**
                * Hitung **Total Omset Kotor** per bulan.
                * Hitung **Total Biaya Operasional** per bulan (produksi + biaya lain).
                * Hitung **Estimasi Profit Bersih** per bulan.
                * Hitung **Net Profit Margin** dalam persentase.
            2.  **Evaluasi Strategi Marketing:**
                * Analisis efektivitas strategi yang digunakan. Apakah strategi tersebut cocok untuk produk ini?
                * Apakah ada potensi kanibalisasi profit karena strategi tertentu (misal diskon terlalu besar)?
            3.  **Potensi & Rekomendasi:**
                * Identifikasi 1-2 **peluang terbesar** untuk meningkatkan profitabilitas (misal: optimasi biaya, up-selling, penyesuaian harga).
                * Berikan 2-3 **rekomendasi strategi marketing lanjutan** yang konkret dan bisa langsung dieksekusi.
                * Apakah produk ini bermain di **Red Ocean** (kompetisi tinggi) atau **Blue Ocean** (kompetisi rendah)? Jelaskan alasannya.
            Format jawaban dalam bentuk laporan ringkas menggunakan Markdown. Gunakan heading, bold, dan bullet points agar mudah dibaca.
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
                    outputDiv.innerHTML = `<p class="text-orange-500 font-bold">AI tidak memberikan respons. Coba lagi.</p>`;
                }
            } catch (err) {
                console.error("AI Analysis Failed:", err);
                outputDiv.innerHTML = `<p class="text-red-500 font-bold">Gagal menghubungi AI. Periksa konsol browser untuk detail error dan pastikan API Key Anda valid.</p>`;
            } finally {
                analyzeButton.disabled = false;
                analyzeButton.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        });
    }
});
