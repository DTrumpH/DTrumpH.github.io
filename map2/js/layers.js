export const wmsLayers = [
  {
    id: "rescue_commands",
    layers: "komandod_prognoosimudelile_db",
    title: { en: "Estonian rescue commands", ee: "Eesti päästekomandod" },
    url: "https://landscape-geoinformatics.ut.ee/geoserver/pa2023/wms?",
    version: "1.1.1",
    format: "image/png",
    transparent: true,
    zIndex: 400, 
  },
  {
    id: "5_minute_areas",
    layers: "rpk_5min_ala_db",
    title: { en: "5 minute coverage area", ee: "5 minutiga kaetav ala" },
    url: "https://landscape-geoinformatics.ut.ee/geoserver/pa2023/wms?",
    version: "1.1.1",
    format: "image/png",
    transparent: true,
    zIndex: 395, 
  },
  {
    id: "10_minute_areas",
    layers: "rpk_10min_ala_db",
    title: { en: "10 minute coverage area", ee: "10 minutiga kaetav ala" },
    url: "https://landscape-geoinformatics.ut.ee/geoserver/pa2023/wms?",
    version: "1.1.1",
    format: "image/png",
    transparent: true,
    zIndex: 390, 
  }
];