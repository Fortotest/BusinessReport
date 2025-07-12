import { marked } from 'marked'; 
import { GoogleGenerativeAI as GoogleGenAI } from '@google/genai'; 

// PENTING: Untuk keamanan, API Key seharusnya tidak ditulis langsung di sini.
// Ini hanya untuk contoh. Dalam aplikasi nyata, gunakan backend atau environment variables.
const API_KEY = "MASUKKAN_API_KEY_ANDA_DI_SINI"; // Ganti dengan API Key Anda

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

  // === INISIALISASI CHART ===
  // (Kode untuk semua chart: gmvChart, marketShareChart, dll. ada di sini)
  // ... (seluruh kode chart dari file asli Anda) ...
  // [PASTE SEMUA KODE DARI 'new Chart' SAMPAI SEBELUM 'AI ANALYST SCRIPT']
  // Kode ini terlalu panjang untuk ditampilkan ulang, cukup salin dari file asli.

  // === LOGIKA LAB STRATEGI ===
  // ... (seluruh kode dari 'const labSection' sampai 'calculateAll();')
  // [PASTE SEMUA KODE DARI BAGIAN LAB STRATEGI]
  // Kode ini terlalu panjang untuk ditampilkan ulang, cukup salin dari file asli.


  // === AI ANALYST SCRIPT ===
  const analyzeButton = document.getElementById('analyze-button'); 
  const outputDiv = document.getElementById('ai-analysis-output'); 

  if (analyzeButton) { 
      analyzeButton.addEventListener('click', async () => { 
          if (!API_KEY || API_KEY === "MASUKKAN_API_KEY_ANDA_DI_SINI") { 
              outputDiv.innerHTML = `<p class="text-red-500 font-bold">Error: API KEY tidak dikonfigurasi. Fungsi AI dinonaktifkan.</p>`; 
              return; 
          }

          const namaProduk = document.getElementById('ai-nama-produk').value; 
          // ... (salin semua pengambilan nilai input lainnya)
          const strategi = document.getElementById('ai-strategi').value; 

          if (!namaProduk || !hargaJual || !terjualBulanan || !hpp || !biayaLain) { 
              outputDiv.innerHTML = `<p class="text-orange-500 font-bold">Harap isi semua kolom data produk untuk analisis yang akurat.</p>`; 
              return; 
          }

          outputDiv.innerHTML = `<p class="text-gray-500 animate-pulse">Menganalisis data dengan AI... Ini mungkin membutuhkan beberapa saat.</p>`; 
          analyzeButton.disabled = true; 
          analyzeButton.classList.add('opacity-50', 'cursor-not-allowed'); 

          // ... (salin semua const prompt Anda di sini)
          const prompt = `Anda adalah seorang analis bisnis...`; 

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

  // Panggil fungsi kalkulasi awal sekali
  // calculateAll(); // Pastikan fungsi ini ada di kode yang Anda salin
});