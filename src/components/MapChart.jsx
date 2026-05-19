import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';
import { RefreshCcw, Layers, Search } from 'lucide-react';
import nutritionData from '../data/nutritionData.json';
import districtData from '../data/districtData.json';

const nationalGeoUrl = "/indonesia-38-provinces.json";

// Mapping: province name in nutritionData.json → kabupaten file slug
const PROV_TO_SLUG = {
  "DKI Jakarta":          "dki-jakarta",
  "Jawa Barat":           "jawa-barat",
  "Jawa Tengah":          "jawa-tengah",
  "DI Yogyakarta":        "di-yogyakarta",
  "Jawa Timur":           "jawa-timur",
  "Banten":               "banten",
  "Aceh":                 "aceh",
  "Sumatera Utara":       "sumatera-utara",
  "Sumatera Barat":       "sumatera-barat",
  "Riau":                 "riau",
  "Jambi":                "jambi",
  "Sumatera Selatan":     "sumatera-selatan",
  "Bengkulu":             "bengkulu",
  "Lampung":              "lampung",
  "Bangka Belitung":      "bangka-belitung",
  "Kepulauan Riau":       "kepulauan-riau",
  "Bali":                 "bali",
  "Nusa Tenggara Barat":  "nusa-tenggara-barat",
  "Nusa Tenggara Timur":  "nusa-tenggara-timur",
  "Kalimantan Barat":     "kalimantan-barat",
  "Kalimantan Tengah":    "kalimantan-tengah",
  "Kalimantan Selatan":   "kalimantan-selatan",
  "Kalimantan Timur":     "kalimantan-timur",
  "Kalimantan Utara":     "kalimantan-utara",
  "Sulawesi Utara":       "sulawesi-utara",
  "Sulawesi Tengah":      "sulawesi-tengah",
  "Sulawesi Selatan":     "sulawesi-selatan",
  "Sulawesi Tenggara":    "sulawesi-tenggara",
  "Gorontalo":            "gorontalo",
  "Sulawesi Barat":       "sulawesi-barat",
  "Maluku":               "maluku",
  "Maluku Utara":         "maluku-utara",
  "Papua Barat":          "papua-barat",
  "Papua":                "papua",
  // Provinsi baru (pemekaran) — belum ada GeoJSON kabupaten, fallback ke provinsi induk
  "Papua Barat Daya":     "papua-barat",
  "Papua Selatan":        "papua",
  "Papua Pegunungan":     "papua",
  "Papua Tengah":         "papua",
};

// Centroids for auto-zooming
const PROV_CENTER = {
  "Aceh": [96.7, 4.2], "Sumatera Utara": [99.1, 2.3], "Sumatera Barat": [100.3, -0.9],
  "Riau": [101.5, 0.5], "Jambi": [102.4, -1.6], "Sumatera Selatan": [104.2, -3.3],
  "Bengkulu": [102.3, -3.8], "Lampung": [105.1, -4.9], "Bangka Belitung": [106.3, -2.7],
  "Kepulauan Riau": [104.5, 1.1], "DKI Jakarta": [106.85, -6.2], "Jawa Barat": [107.6, -6.9],
  "Jawa Tengah": [110.1, -7.2], "DI Yogyakarta": [110.4, -7.8], "Jawa Timur": [112.5, -7.6],
  "Banten": [106.1, -6.4], "Bali": [115.2, -8.4], "Nusa Tenggara Barat": [117.5, -8.6],
  "Nusa Tenggara Timur": [121.0, -9.5], "Kalimantan Barat": [110.0, 0.0],
  "Kalimantan Tengah": [113.9, -1.6], "Kalimantan Selatan": [115.4, -3.2],
  "Kalimantan Timur": [116.4, 0.5], "Kalimantan Utara": [116.5, 3.0],
  "Sulawesi Utara": [124.7, 1.0], "Sulawesi Tengah": [121.5, -1.4],
  "Sulawesi Selatan": [120.0, -3.8], "Sulawesi Tenggara": [122.2, -4.1],
  "Gorontalo": [122.4, 0.6], "Sulawesi Barat": [119.3, -2.5],
  "Maluku": [129.5, -3.5], "Maluku Utara": [127.8, 1.0],
  "Papua": [138.5, -4.0], "Papua Barat": [133.0, -1.5],
  "Papua Barat Daya": [131.5, -1.1], "Papua Selatan": [139.0, -7.0],
  "Papua Pegunungan": [139.0, -4.3], "Papua Tengah": [136.5, -3.8],
};

const PROV_ZOOM = {
  "DKI Jakarta": 18, "DI Yogyakarta": 16, "Bali": 14,
  "Bangka Belitung": 10, "Gorontalo": 10, "Bengkulu": 9,
  "Aceh": 6, "Sumatera Utara": 6, "Sumatera Barat": 7,
  "Riau": 6, "Jambi": 7, "Sumatera Selatan": 6, "Lampung": 8,
  "Kepulauan Riau": 7, "Jawa Barat": 8, "Jawa Tengah": 8,
  "Jawa Timur": 7, "Banten": 10,
  "Nusa Tenggara Barat": 9, "Nusa Tenggara Timur": 6,
  "Kalimantan Barat": 5, "Kalimantan Tengah": 5,
  "Kalimantan Selatan": 7, "Kalimantan Timur": 5, "Kalimantan Utara": 6,
  "Sulawesi Utara": 7, "Sulawesi Tengah": 5, "Sulawesi Selatan": 6,
  "Sulawesi Tenggara": 6, "Sulawesi Barat": 8,
  "Maluku": 4, "Maluku Utara": 5,
  "Papua": 4, "Papua Barat": 5,
  "Papua Barat Daya": 5, "Papua Selatan": 4,
  "Papua Pegunungan": 5, "Papua Tengah": 4,
};

const MapChart = ({ onSelectRegion, selectedId }) => {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, data: null });
  const [drillDown, setDrillDown] = useState(null); // { name, geoUrl, provData }
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([118, -2]);
  const containerRef = useRef(null);

  // Fixed map projection base settings
  const FIXED_SCALE  = 1600;
  const FIXED_CENTER = [118, -2];

  // Sync state with external reset or selection (e.g. clicking Logo or using Search Bar)
  useEffect(() => {
    if (!selectedId) {
      if (drillDown) {
        setDrillDown(null);
        setZoom(1);
        setCenter(FIXED_CENTER);
      }
    } else {
      // Determine the target province (works for both province and district objects)
      const targetProvName = selectedId.province || selectedId.name;
      
      // Auto-zoom if we are not already drilled down into this province
      if (!drillDown || drillDown.name !== targetProvName) {
        const slug = PROV_TO_SLUG[targetProvName];
        if (slug) {
          const centroid = PROV_CENTER[targetProvName] || FIXED_CENTER;
          const zoomLevel = PROV_ZOOM[targetProvName] || 6;
          
          const geoProvNameMap = {
            "dki-jakarta": "Jakarta Raya",
            "di-yogyakarta": "Yogyakarta",
            "bangka-belitung": "Bangka Belitung",
          };
          const geoProvName = geoProvNameMap[slug] || targetProvName;

          setCenter(centroid);
          setZoom(zoomLevel);
          setDrillDown({
            name: targetProvName,
            geoUrl: `/kabupaten/${slug}.json`,
            geoProvName: geoProvName,
          });
        }
      }
    }
  }, [selectedId?.id, selectedId?.name, drillDown?.name]);

  // Filter district data to only the selected province
  const districtFiltered = drillDown
    ? districtData.filter(d => d.province === drillDown.geoProvName)
    : [];

  const activeData = drillDown ? districtFiltered : nutritionData;

  const colorScale = scaleQuantile()
    .domain(nutritionData.map(d => d.stunting)) // Use national range for consistent colors
    .range(["#10b981", "#34d399", "#fbbf24", "#f59e0b", "#ef4444"]);

  const getRelativePos = useCallback((e) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip({ visible: false, x: 0, y: 0, data: null });
  }, []);

  const handleReset = () => {
    setDrillDown(null);
    setZoom(1);
    setCenter(FIXED_CENTER);
    onSelectRegion(null);
  };

  const onMapClick = (geo, cur) => {
    if (!cur) return;

    if (!drillDown) {
      // Province click → drill down kabupaten (peta BERGERAK/ZOOM)
      const slug = PROV_TO_SLUG[cur.name];
      if (!slug) {
        console.warn('No kabupaten data for', cur.name);
        onSelectRegion(cur);
        return;
      }

      const centroid = PROV_CENTER[cur.name] || FIXED_CENTER;
      const zoomLevel = PROV_ZOOM[cur.name] || 6;

      const geoProvNameMap = {
        "dki-jakarta": "Jakarta Raya",
        "di-yogyakarta": "Yogyakarta",
        "bangka-belitung": "Bangka Belitung",
      };
      const geoProvName = geoProvNameMap[slug] || cur.name;

      setCenter(centroid);
      setZoom(zoomLevel);
      setDrillDown({
        name: cur.name,
        geoUrl: `/kabupaten/${slug}.json`,
        geoProvName: geoProvName,
      });
      onSelectRegion(cur);
    } else {
      // Kabupaten click → show detail
      onSelectRegion(cur);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full cursor-crosshair" style={{ position: 'relative', background: '#020617' }}>
      
      {/* Top-left: Province label when drilled down */}
      {drillDown && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-5 left-5 z-20 pointer-events-none"
        >
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 px-5 py-3 rounded-2xl shadow-2xl">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Drill-down</p>
            <h4 className="text-white font-black text-lg leading-tight">{drillDown.name}</h4>
            <p className="text-[10px] text-emerald-400/60 font-bold mt-1 flex items-center gap-1.5">
              <Search size={10} /> Klik kabupaten untuk detail
            </p>
          </div>
        </motion.div>
      )}

      {/* Top-right: Controls */}
      <div className="absolute top-5 right-5 z-20 flex flex-col gap-2.5">
        {drillDown && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleReset}
            className="flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 rounded-2xl font-black text-xs tracking-wide transition-all shadow-[0_8px_25px_rgba(16,185,129,0.3)] active:scale-95"
          >
            <RefreshCcw size={14} /> Kembali ke Nasional
          </motion.button>
        )}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/30 px-4 py-2.5 rounded-2xl flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.15em]">
            {drillDown ? 'Level Kabupaten' : 'Level Provinsi'}
          </span>
        </div>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: FIXED_SCALE, center: FIXED_CENTER }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          center={center}
          zoom={zoom}
          disablePanning
          disableZooming
        >
          {/* Layer 1: Selalu tampilkan peta provinsi nasional */}
          <Geographies geography={nationalGeoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const props = geo.properties;
                const name  = props.PROVINSI || props.name || '';
                const cur   = nutritionData.find(d =>
                  String(d.id).trim() === String(props.KODE_PROV || props.id || '').trim() ||
                  d.name.toLowerCase() === name.toLowerCase()
                );
                const isSelected = drillDown && drillDown.name === (cur?.name || name);

                // Jika sedang drillDown, sembunyikan provinsi lain
                if (drillDown && !isSelected) return null;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={(e) => {
                      if (!cur && !name) return;
                      const { x, y } = getRelativePos(e);
                      setTooltip({ visible: true, x, y,
                        data: cur || { name, stunting: 0, wasting: 0, underweight: 0 } });
                    }}
                    onMouseMove={(e) => {
                      const { x, y } = getRelativePos(e);
                      setTooltip(prev => ({ ...prev, x, y }));
                    }}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => !drillDown && onMapClick(geo, cur || { name, stunting: 20, wasting: 7, underweight: 13 })}
                    style={{
                      default: {
                        fill: cur ? colorScale(cur.stunting) : "#334155",
                        stroke: isSelected ? "#ffffff" : "#0f172a",
                        strokeWidth: isSelected ? 1.5 : 0.4,
                        outline: "none",
                        transition: "all 200ms",
                        opacity: drillDown && !isSelected ? 0 : 1,
                      },
                      hover: {
                        fill: cur ? colorScale(cur.stunting) : "#475569",
                        stroke: drillDown ? "#0f172a" : "#fff",
                        strokeWidth: drillDown ? 0.4 : 1.5,
                        outline: "none",
                        cursor: drillDown ? "default" : "pointer",
                        filter: drillDown ? "none" : "brightness(1.25) saturate(1.1)",
                      },
                      pressed: { fill: "#10b981", outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Layer 2: Kabupaten overlay (ditampilkan di atas provinsi saat drill-down) */}
          {drillDown && (
            <Geographies geography={drillDown.geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const props = geo.properties;
                  const name  = props.NAME_2 || '';
                  const cur   = districtFiltered.find(d => d.name.toLowerCase() === name.toLowerCase());
                  const isSelected = selectedId && cur && String(cur.id) === String(selectedId?.id);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={(e) => {
                        const { x, y } = getRelativePos(e);
                        setTooltip({ visible: true, x, y,
                          data: cur || { name, stunting: 0, wasting: 0, underweight: 0 } });
                      }}
                      onMouseMove={(e) => {
                        const { x, y } = getRelativePos(e);
                        setTooltip(prev => ({ ...prev, x, y }));
                      }}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => onMapClick(geo, cur || { name, stunting: 20, wasting: 7, underweight: 13 })}
                      style={{
                        default: {
                          fill: cur ? colorScale(cur.stunting) : "#475569",
                          stroke: isSelected ? "#fff" : "rgba(15,23,42,0.9)",
                          strokeWidth: isSelected ? 1.5 : 0.3,
                          outline: "none",
                          transition: "all 200ms",
                        },
                        hover: {
                          fill: cur ? colorScale(cur.stunting) : "#64748b",
                          stroke: "#fff",
                          strokeWidth: 1,
                          outline: "none",
                          cursor: "pointer",
                          filter: "brightness(1.3) saturate(1.1)",
                        },
                        pressed: { fill: "#10b981", outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          )}
        </ZoomableGroup>
      </ComposableMap>

      {/* ── Tooltip ── */}
      {tooltip.visible && tooltip.data && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(tooltip.x + 20, (containerRef.current?.offsetWidth || 800) - 280),
            top: (tooltip.y + 200 > (containerRef.current?.offsetHeight || 400))
                ? Math.max(10, tooltip.y - 200)
                : tooltip.y + 20,
            pointerEvents: 'none',
            zIndex: 100,
          }}
        >
          <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] min-w-[220px]">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
              {drillDown ? 'Kabupaten / Kota' : 'Provinsi'}
            </p>
            <h4 className="text-white font-black text-lg mb-3 pb-2 border-b border-white/5">{tooltip.data.name}</h4>
            <div className="space-y-2.5">
              {[
                { label: 'Stunting', val: tooltip.data.stunting, col: tooltip.data.stunting >= 25 ? '#ef4444' : tooltip.data.stunting >= 15 ? '#fbbf24' : '#10b981' },
                { label: 'Wasting', val: tooltip.data.wasting, col: '#f97316' },
                { label: 'Underweight', val: tooltip.data.underweight, col: '#a78bfa' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px] font-bold">{item.label}</span>
                  <span style={{ color: item.col }} className="font-black text-sm">{item.val?.toFixed?.(1) || '—'}%</span>
                </div>
              ))}
            </div>
            {!drillDown && (
              <p className="text-[9px] text-emerald-400 font-bold mt-3 pt-2 border-t border-white/5 flex items-center gap-1.5 animate-pulse">
                <Layers size={10} /> Klik untuk lihat Kabupaten
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(MapChart);
