import { marked } from 'marked';
import { GoogleGenerativeAI } from '@google/genai';

const API_KEY = "AIzaSyDkAVtL00WxWCslXTONGyjpvLNUgySHg64";

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

function unformatRupiah(rupiah_string) {
    if (!rupiah_string || typeof rupiah_string !== 'string') return 0;
    return parseFloat(rupiah_string.replace(/\./g, ''));
}

document.addEventListener('DOMContentLoaded', function() {
    const chartColors = { /* ... (kode warna sama seperti versi sebelumnya) ... */ };
    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.color = chartColors.text;

    const menuButton = document.getElementById('menu-button');
    const navLinksContainer = document.getElementById('nav-links');
    menuButton.addEventListener('click', () => {
        navLinksContainer.classList.toggle('hidden');
    });

    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    function activateTab(targetId) {
        navLinks.forEach(link => link.classList.remove('active'));
        contentSections.forEach(section => section.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[href="#${targetId}"]`);
        const activeSection = document.getElementById(targetId);
        if (activeLink) activeLink.classList.add('active');
        if (activeSection) activeSection.classList.add('active');
        if (window.innerWidth < 768) { navLinksContainer.classList.add('hidden'); }
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
        activateTab(window.location.hash.substring(1));
    } else {
        activateTab('landscape');
    }

    // --- INISIALISASI SEMUA GRAFIK ---
    new Chart(document.getElementById('gmvChart'), { /* ... (kode sama) ... */ });
    new Chart(document.getElementById('marketShareChart'), { /* ... (kode sama) ... */ });
    
    let budgetChart;
    function updateBudgetChart() { /* ... (kode sama) ... */ }
    const marketingBudgetEl = document.getElementById('marketingBudget');
    if(marketingBudgetEl) { marketingBudgetEl.addEventListener('input', updateBudgetChart); }
    updateBudgetChart();

    new Chart(document.getElementById('sentimentChart'), { /* ... (kode sama) ... */ });
    const competitorData = [ /* ... (kode sama) ... */ ];
    new Chart(document.getElementById('competitorMap'), { /* ... (kode sama) ... */ });
    
    const labSection = document.getElementById('lab');
    const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
    function calculateAll() { /* ... (kode sama) ... */ }
    const rupiahInputs = ['hargaJual', 'hpp', 'biayaIklan', 'fixedCosts', 'avgPurchaseValue', 'marketingBudget', 'ai-harga-jual', 'ai-hpp', 'ai-biaya-lain'];
    rupiahInputs.forEach(id => {
        const inputElement = document.getElementById(id);
        if (inputElement) { inputElement.addEventListener('keyup', function(e) { this.value = formatRupiah(this.value); }); }
    });
    if (labSection) { labSection.addEventListener('input', calculateAll); }
    
    const businessModelForm = document.getElementById('businessModelForm');
    if (businessModelForm) { /* ... (kode sama) ... */ }
    const opportunityForm = document.getElementById('opportunityForm');
    if (opportunityForm) { /* ... (kode sama) ... */ }
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

    // --- LOGIKA AI ANALYST TERINTEGRASI ---
    const analyzeButton = document.getElementById('analyze-button');
    const outputDiv = document.getElementById('ai-analysis-output');
    if (analyzeButton) {
        analyzeButton.addEventListener('click', async () => {
            if (!API_KEY || API_KEY.includes("GANTI_DENGAN")) {
                outputDiv.innerHTML = `<p class="text-red-500 font-bold">Error: API Key tidak dimasukkan.</p>`;
                return;
            }
            const labNetMargin = document.getElementById('netMargin').textContent;
            const labBep = document.getElementById('bepResult').innerText;
            const labLtv = document.getElementById('ltvResult').innerText.replace('Estimasi LTV per Pelanggan: ', '');
            const labModel = document.getElementById('businessModelResult').innerText;
            const namaProduk = document.getElementById('ai-nama-produk').value;
            const hargaJual = unformatRupiah(document.getElementById('ai-harga-jual').value);
            const terjualBulanan = parseFloat(document.getElementById('ai-terjual-bulanan').value);
            const hpp = unformatRupiah(document.getElementById('ai-hpp').value);
            const biayaLain = unformatRupiah(document.getElementById('ai-biaya-lain').value);
            const strategi = document.getElementById('ai-strategi').value;
            if (!namaProduk) {
                outputDiv.innerHTML = `<p class="text-orange-500 font-bold">Harap isi data di form AI Analyst.</p>`;
                return;
            }
            outputDiv.innerHTML = `<p class="text-gray-500 animate-pulse">Menganalisis data secara terintegrasi...</p>`;
            analyzeButton.disabled = true;
            analyzeButton.classList.add('opacity-50', 'cursor-not-allowed');
            
            const prompt = `
            Persona: You are a brutally intelligent financial and marketing strategist AI...
            ---
            **DOSSIER BISNIS LENGKAP:**
            **BAGIAN A: KONDISI PASAR MAKRO 2025**
            - Proyeksi GMV: US$90-95 Miliar
            - Profil Konsumen: Usia 26-35, mobile-first, pembayaran e-wallet.
            - Arena Kompetisi: Duopoli ketat antara TikTok-Tokopedia vs. Shopee.
            **BAGIAN B: SIMULASI INTERNAL BISNIS LO (Dari Kalkulator)**
            - Proyeksi Net Profit Margin: ${labNetMargin}
            - Kebutuhan Break-Even Point: ${labBep}
            - Rekomendasi Model Bisnis: ${labModel}
            - Estimasi LTV per Pelanggan: ${labLtv}
            **BAGIAN C: ANALISIS PRODUK SPESIFIK (Input Manual)**
            - Nama Produk: ${namaProduk}
            - Harga Jual: Rp ${parseFloat(hargaJual).toLocaleString('id-ID')}
            - Terjual/Bulan: ${parseFloat(terjualBulanan).toLocaleString('id-ID')} unit
            - HPP/Unit: Rp ${parseFloat(hpp).toLocaleString('id-ID')}
            - Biaya Lain/Unit: Rp ${parseFloat(biayaLain).toLocaleString('id-ID')}
            - Klaim Strategi Marketing: ${strategi || "Tidak disebutkan"}
            ---
            **TUGAS LO SEKARANG:**
            Berdasarkan **semua data** di atas, berikan gue **Laporan Strategis Terintegrasi**.
            ### 1. Diagnosis Brutal
            Sintesiskan semua data. Bisnis ini sehat, sekarat, atau cuma halu? Bandingkan simulasi internal (Bagian B) dengan data produk (Bagian C). Ada yang janggal?
            ### 2. Sinkronisasi Strategi vs. Pasar
            Apakah model bisnis dan margin yang lo simulasikan di lab cocok dengan kondisi pasar yang lagi perang harga? Kalau enggak, lo salah di mana?
            ### 3. Perintah Eksekusi Terintegrasi
            - **URGENT:** Apa yang harus dihentikan SEKARANG JUGA?
            - **STRATEGIS:** Pilih Jalur A (Volume) atau Jalur B (Nilai)? Putuskan berdasarkan data.
            - **MARKETING:** Rekomendasi marketing apa yang paling masuk akal?
            ---
            **ATURAN MAIN:**
            Format sebagai laporan bisnis tajam. Gunakan Markdown (###, bullet points). Akhiri dengan pertanyaan menantang.
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
                outputDiv.innerHTML = `<p class="text-red-500 font-bold">Gagal menghubungi AI. Cek konsol dan API Key Anda.</p>`;
            } finally {
                analyzeButton.disabled = false;
                analyzeButton.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        });
    }
});
