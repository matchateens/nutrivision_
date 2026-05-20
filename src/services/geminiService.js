/**
 * NutriVision ID - AI Strategic Insight Service
 * Mode Hibrida: Menggunakan Gemini API jika API Key tersedia, atau Local Intelligence Engine jika offline.
 */

// Konfigurasi Konstanta Kebijakan
const HARI_MAKAN_PER_TAHUN = 250;
const KAPASITAS_DAPUR = 3000;
const RATIO_ANAK_SEKOLAH = 0.178;

/**
 * Menganalisis data wilayah secara lokal dan menyusun brief rekomendasi kebijakan taktis.
 * Berperan sebagai fallback lokal yang menghasilkan teks analitis berkualitas tinggi.
 */
function getLocalStrategicInsight(region) {
  const isDistrict = !!region.province;
  const regionType = isDistrict ? "Kabupaten/Kota" : "Provinsi";
  const parentText = isDistrict ? ` di Provinsi ${region.province}` : "";

  // 1. Klasifikasi Keparahan Stunting
  let stuntingStatus = "Aman";
  let stuntingColor = "Hijau (Kondisi Terkendali)";
  let stuntingDesc = "Prevalensi di bawah ambang batas kritis nasional (<15%). Prioritas dialihkan pada pemeliharaan gizi dan penguatan sistem pangan lokal.";
  
  if (region.stunting >= 25.0) {
    stuntingStatus = "Darurat Gizi Utama";
    stuntingColor = "Merah (Tingkat Kritis)";
    stuntingDesc = "Prevalensi stunting sangat tinggi (>25%). Wilayah ini memerlukan intervensi gizi spesifik segera dan alokasi anggaran prioritas nasional.";
  } else if (region.stunting >= 15.0) {
    stuntingStatus = "Waspada Gizi Sedang";
    stuntingColor = "Kuning (Siaga)";
    stuntingDesc = "Prevalensi sedang (15-25%). Diperlukan akselerasi intervensi sensitif seperti sanitasi dan edukasi gizi untuk menekan laju prevalensi.";
  }

  // 2. Evaluasi Wasting (Kurus/Gizi Buruk Akut)
  let wastingAlert = "";
  if (region.wasting >= 10.0) {
    wastingAlert = "\n⚠️ **Peringatan Gizi Buruk Akut (Wasting > 10%):** Wilayah ini mengalami beban ganda (double burden) dengan tingkat wasting kritis. Program makanan bergizi harus diperkaya dengan asupan mikronutrien tinggi kalori (terapeutik) untuk mencegah mortalitas balita.";
  }

  // 3. Analisis MBG & Dapur SPPG
  const popAnak = Math.round(region.population * RATIO_ANAK_SEKOLAH);
  const cakupanPersen = popAnak > 0 ? ((region.mbg_penerima / popAnak) * 100).toFixed(1) : 0;
  
  let mbgStatus = "Kesiapan Tinggi";
  let mbgAction = "Fokus pada optimalisasi rantai pasok bahan makanan lokal dari petani sekitar untuk mendorong ekonomi wilayah.";
  if (region.mbg_progress < 40) {
    mbgStatus = "Kesiapan Rendah (Kritis)";
    mbgAction = "Prioritaskan pembangunan infrastruktur Dapur SPPG baru, pengadaan alat masak standar BGN, dan pelatihan tenaga masak lokal.";
  } else if (region.mbg_progress < 70) {
    mbgStatus = "Kesiapan Menengah";
    mbgAction = "Fokus pada perluasan jangkauan distribusi ke sekolah-sekolah di pelosok dan penguatan kolaborasi dengan puskesmas setempat.";
  }

  // Perhitungan Kebutuhan Dapur Baru untuk 100% Coverage
  const gapAnak = Math.max(0, popAnak - (region.mbg_penerima || 0));
  const tambahanDapur = Math.ceil(gapAnak / KAPASITAS_DAPUR);

  // 4. Analisis Tren Historis
  let trendText = "";
  if (region.trend && region.trend.length >= 2) {
    const awal = region.trend[0];
    const akhir = region.stunting;
    const totalPenurunan = (awal - akhir).toFixed(1);
    
    if (totalPenurunan > 5) {
      trendText = `Menunjukkan progres positif yang signifikan dengan penurunan sebesar **-${totalPenurunan}%** sejak 2019. Model intervensi di daerah ini dapat direplikasi di wilayah lain.`;
    } else if (totalPenurunan > 0) {
      trendText = `Mengalami penurunan lambat sebesar **-${totalPenurunan}%** sejak 2019. Laju penurunan kurang dari 1.5% per tahun, membutuhkan akselerasi program Makan Bergizi Gratis (MBG).`;
    } else {
      trendText = `Mengalami stagnasi atau kenaikan kasus stunting sejak 2019. Evaluasi total terhadap program PMT (Pemberian Makanan Tambahan) dan sanitasi air bersih harus segera dilakukan.`;
    }
  }

  // 5. Rekomendasi Alokasi Fiskal
  const estimasiBiayaTahun = (region.mbg_biaya || 10000) * HARI_MAKAN_PER_TAHUN;
  const totalAnggaran100 = (popAnak * estimasiBiayaTahun / 1e9).toFixed(1);

  // Format Teks Markdown
  return `### 📊 Ringkasan Diagnostik Wilayah
* **Kategori Kerawanan:** ${stuntingStatus} (${region.stunting}%)
* **Status Kesiapan MBG:** ${mbgStatus} (${region.mbg_progress}%)
* **Analisis Historis:** ${trendText} ${wastingAlert}

### 🍱 Evaluasi Operasional Makan Bergizi Gratis (MBG)
* **Cakupan Saat Ini:** Baru menjangkau **${cakupanPersen}%** anak sekolah (${(region.mbg_penerima/1000).toFixed(0)}K penerima dari ${(popAnak/1000).toFixed(0)}K sasaran).
* **Kesiapan Infrastruktur:** Saat ini terdapat **${region.mbg_dapur} unit Dapur SPPG**.
* **Kesenjangan Kapasitas:** Diperlukan penambahan minimal **${tambahanDapur} unit Dapur SPPG** baru untuk mencapai cakupan 100% sasaran anak sekolah di wilayah ini.

### 🎯 Rekomendasi Kebijakan & Strategis
1. **Akselerasi Infrastruktur:** ${mbgAction}
2. **Prioritas Alokasi Dana:** Membutuhkan total anggaran sekitar **Rp ${totalAnggaran100} Miliar/tahun** untuk membiayai program makanan bergizi secara penuh bagi seluruh anak sekolah.
3. **Intervensi Gizi Terintegrasi:** Integrasikan menu makanan dengan zat gizi lokal tinggi protein hewani (seperti ikan laut, telur, atau produk ternak lokal) guna memaksimalkan dampak penurunan stunting tahunan sebesar estimasi **~2.5% hingga 3.2%** per tahun.`;
}

/**
 * Menghasilkan Analisis AI Gizi Strategis.
 * Menggunakan Gemini API (Vite Environment Variable) jika ada, jika tidak fallback ke Local Advisor.
 */
export async function getAiSummary(region) {
  if (!region) return "";

  // Mengambil API Key dari import.meta.env (Vite environment variables)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "YOUR_API_KEY_PLACEHOLDER") {
    // Mode Offline: Simulasi AI Advisor menggunakan Local Rules Engine (Bebas Error & Instan)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getLocalStrategicInsight(region));
      }, 800); // beri sedikit delay simulasi loading AI
    });
  }

  // Mode Online: Query asli ke Google Gemini 1.5 Flash API
  try {
    const isDistrict = !!region.province;
    const parentText = isDistrict ? ` di Provinsi ${region.province}` : "";
    
    const prompt = `Anda adalah Analis Kebijakan Publik & Gizi Nasional dari Badan Gizi Nasional Indonesia.
Berikan brief analisis strategis gizi dan rekomendasi program Makan Bergizi Gratis (MBG) untuk wilayah berikut:
- Nama Wilayah: ${region.name} (${isDistrict ? 'Kabupaten/Kota' : 'Provinsi'}${parentText})
- Angka Stunting Aktual (SKI 2023): ${region.stunting}%
- Angka Wasting (Kurus): ${region.wasting}%
- Angka Underweight: ${region.underweight}%
- Kesiapan Program MBG: ${region.mbg_progress}%
- Jumlah Dapur SPPG Saat Ini: ${region.mbg_dapur} unit
- Jumlah Penerima MBG Terjadwal: ${region.mbg_penerima} anak
- Populasi Total Wilayah: ${region.population.toLocaleString('id-ID')} jiwa
- Tren Stunting Historis (2019-2024): ${region.trend?.join('%, ')}%

Format output harus menggunakan Markdown yang ringkas dan profesional dengan 3 bagian berikut:
1. ### 📊 Ringkasan Diagnostik Wilayah (berikan penilaian kerawanan gizi dan analisis tren historis)
2. ### 🍱 Evaluasi Operasional Makan Bergizi Gratis (MBG) (analisis cakupan saat ini, kesiapan infrastruktur dapur SPPG, dan gap tambahan dapur yang dibutuhkan untuk 100% cover anak sekolah yaitu 17.8% dari populasi, dengan kapasitas 1 dapur = 3.000 anak)
3. ### 🎯 Rekomendasi Kebijakan & Strategis (rekomendasi taktis berupa alokasi anggaran, menu berbasis pangan lokal untuk stunting, dan integrasi lintas dinas)

Bahasa: Indonesia resmi, lugas, dan taktis. Batasi output maksimal 250 kata.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (textResult) {
      return textResult.trim();
    } else {
      throw new Error("No text returned from Gemini API");
    }
  } catch (error) {
    console.warn("Gagal menggunakan Gemini API, beralih ke analisis lokal. Error:", error);
    // Fallback otomatis jika API error/limit/no internet
    return getLocalStrategicInsight(region);
  }
}
