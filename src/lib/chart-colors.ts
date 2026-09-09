/**
 * Paleta categórica validada (orden fijo, seguro para daltonismo) usada en los
 * gráficos del panel. No reordenar: el orden es el mecanismo de seguridad CVD.
 */
export const CATEGORICAL_COLORS = [
  "#2a78d6", // 1 azul
  "#eb6834", // 2 naranjo
  "#1baf7a", // 3 aqua
  "#eda100", // 4 amarillo
  "#e87ba4", // 5 magenta
  "#008300", // 6 verde
  "#4a3aa7", // 7 violeta
  "#e34948", // 8 rojo
];

/** Rampa secuencial (un solo hue, azul) para etapas ordinales como un embudo. */
export const SEQUENTIAL_BLUE = {
  light: "#6da7ec", // step 300
  mid: "#2a78d6", // step 450
  dark: "#184f95", // step 600
};

export const TEXT_MUTED = "#898781";
export const TEXT_SECONDARY = "#52514e";
