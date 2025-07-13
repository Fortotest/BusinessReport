import { marked } from 'marked';
import { GoogleGenerativeAI as GoogleGenAI } from '@google/genai';

// --- BAGIAN INI SUDAH DIPERBAIKI ---
const API_KEY = "AIzaSyDkAVtL00WxWCslXTONGyjpvLNUgySHg64";

document.addEventListener('DOMContentLoaded', function() {
    const chartColors = {
        accent: '#007AFF', accentLight: 'rgba(0, 122, 255, 0.2)', text: '#333',
        grid: 'rgba(0, 0, 0, 0.05)', green: '#34C759', orange: '#FF9500',
        purple: '#AF52DE', gray: '#8E8E93', red: '#FF3B30', yellow: '#FFCC00'
    };

    Chart.defaults.font.family = "'Poppins', sans-serif";
    Chart.defaults.color = chartColors.text;

    // === NAVIGASI TAB ===
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

    document.getElementById('nav-links').addEventListener('click', function(e) {
        if (e.target.classList.contains('nav-link')) {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            activateTab(targetId);
        }
    });

    // Anda perlu memasukkan kembali kode untuk inisialisasi Chart.js di sini
    // dan juga logika untuk kalkulator dari file asli Anda.

    // === AI ANALYST SCRIPT ===
    const analyzeButton = document.getElementById('analyze-button');
    const outputDiv = document.getElementById('ai-analysis-output');

    if (analyzeButton) {
        analyzeButton.addEventListener('click', async () => {
            if (!API_KEY || API_KEY.includes("GANTI_DENGAN")) { // Pengecekan lebih baik
                outputDiv.innerHTML = `<p class="text-red-500 font-bold">Error: API KEY tidak dikonfigurasi. Harap masukkan kunci yang valid.</p>`;
                return;
            }

            const namaProduk = document.getElementById('ai-nama-produk').value;
            // Pastikan Anda mendefinisikan variabel-variabel ini
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

            const prompt = `Anda adalah seorang analis bisnis e-commerce ahli di Indonesia... (salin sisa prompt lengkap Anda di sini)`;

            try {
                const ai = new GoogleGenAI(API_KEY);
                const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
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
    
    // Pastikan fungsi calculateAll() dari file asli Anda ada di sini dan dipanggil
    // calculateAll(); 
});
