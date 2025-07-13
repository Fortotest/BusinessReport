import { marked } from 'marked';
import { GoogleGenerativeAI } from '@google/genai';

const API_KEY = "AIzaSyDkAVtL00WxWCslXTONGyjpvLNUgySHg64"; // API Key Anda

// Fungsi untuk format dan unformat Rupiah
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
    // Kode Chart.js, Navigasi, dan Kalkulator lainnya tetap sama...
    // (Seluruh kode lain dari versi sebelumnya ada di sini)
    const chartColors = {
        accent: '#007AFF', accentLight: 'rgba(0, 122, 255, 0.2)', text: '#333',
        grid: 'rgba(0, 0, 0, 0.05)', green: '#34C759', orange: '#FF9500',
        purple: '#AF52DE', gray: '#8E8E93', red: '#FF3B30', yellow: '#FFCC00',
        tokopediaColor: '#42b549', shopeeColor: '#ee4d2d'
    };
    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.color = chartColors.text;
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
    new Chart(document.getElementById('gmvChart'), { type: 'line', data: { labels: ['Q4 2023', 'Q2 2024', 'Q4 2024', 'Q2 2025 (Est.)'], datasets: [{ label: 'GMV (US$ Miliar)', data: [75, 82, 88, 95], borderColor: chartColors.accent, backgroundColor: chartColors.accentLight, fill: true, tension: 0.4 }] }, options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { display: false } }, scales: { y: { border: { display: false } }, x: { border: { display: false } } } } });
    new Chart(document.getElementById('marketShareChart'), { type: 'doughnut', data: { labels: ['TikTok-Tokopedia', 'Shopee', 'Lazada', 'Blibli', 'Lainnya'], datasets: [{ label: 'Pangsa Pasar GMV', data: [41, 40, 9, 4, 6], backgroundColor: [ chartColors.tokopediaColor, chartColors.shopeeColor, chartColors.orange, chartColors.purple, chartColors.gray ], borderColor: '#f8f7f4', borderWidth: 4, hoverOffset: 8 }] }, options: { maintainAspectRatio: false, responsive: true, plugins: { legend: { display: true, position: 'bottom', labels: { padding: 15 } } } } });
    
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
            outputDiv.innerHTML = `<p class="text-gray-500 animate-pulse">Menganalisis data...</p>`;
            analyzeButton.disabled = true;
            analyzeButton.classList.add('opacity-50', 'cursor-not-allowed');
            
            // --- PROMPT BARU DENGAN STRUKTUR YANG LEBIH BAIK ---
            const prompt = `
            Tugas Utama: Lo adalah seorang analis strategi e-commerce yang beringas. Tugas lo adalah menganalisis data produk berikut dan memberikan laporan tajam.

            ### Data Mentah
            - Nama Produk: ${namaProduk}
            - Harga Jual: Rp ${parseFloat(hargaJual).toLocaleString('id-ID')}
            - Terjual/Bulan: ${parseFloat(terjualBulanan).toLocaleString('id-ID')} unit
            - HPP/Unit: Rp ${parseFloat(hpp).toLocaleString('id-ID')}
            - Biaya Lain/Unit (Logistik, Admin, dll): Rp ${parseFloat(biayaLain).toLocaleString('id-ID')}
            - Klaim Strategi Marketing: ${strategi || "Tidak disebutkan"}

            ### Laporan Analisis yang Harus Lo Buat
            1.  **Analisis Profitabilitas:**
                * Hitung Omset Kotor bulanan.
                * Hitung semua Biaya Variabel (HPP + Biaya Lain).
                * Hitung **Margin Kontribusi** per unit dan total.
                * Hitung **Profit Bersih** bulanan dan **Net Profit Margin** dalam persen. Beri komentar tajam jika marginnya tipis.

            2.  **Evaluasi Strategi Marketing:**
                * Analisis efektivitas strategi yang diklaim. Apakah itu cuma aktivitas bakar uang?
                * Jika ada "Flash Sale", pertanyakan dampaknya ke margin.
                * Jika ada "Iklan", tantang nilai ROAS-nya.

            3.  **Perintah Strategis:**
                * **Prioritas #1 (URGENT):** Apa satu hal yang harus segera dihentikan/diperbaiki?
                * **Prioritas #2 (JANGKA PENDEK):** Apa langkah paling logis untuk menaikkan PROFIT, bukan cuma omset?
                * **Vonis Akhir:** Produk ini bermain di **Red Ocean** (perang harga) atau **Blue Ocean** (niche)? Jelaskan.

            ### Aturan & Gaya Bahasa
            - **Karakter:** Brutal, cerdas, tanpa basa-basi. Posisikan diri sebagai CFO yang benci omong kosong.
            - **Bahasa:** Gunakan "lo-gue", sarkasme tajam. Istilah teknis tetap dalam Bahasa Inggris (CAC, ROAS, LTV, margin).
            - **Fokus:** Hancurkan metrik palsu, temukan kelemahan finansial, dan berikan perintah yang bisa dieksekusi.
            - **Format:** Gunakan Markdown (heading ###, bullet points).
            - **Penutup:** Akhiri dengan pertanyaan menantang, bukan rangkuman manis.
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
