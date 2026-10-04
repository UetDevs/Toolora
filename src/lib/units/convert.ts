export const KG_TO_LB = 2.2046226218487757;
export const LB_TO_KG = 0.45359237;
export const CM_PER_INCH = 2.54;
export const CM_PER_FOOT = 30.48;
export const M_PER_FOOT = 0.3048;
export const KM_PER_MILE = 1.609344;
export const LITERS_PER_US_GALLON = 3.785411784;
export const KM_PER_MILE_SPEED = 1.609344;
export const KG_PER_STONE = 6.35029318;
export const ML_PER_US_FLOZ = 29.5735295625;
export const BAR_PER_PSI = 0.0689475729;
export const HP_PER_WATT = 1 / 745.6998715822702;
export const M2_PER_ACRE = 4046.8564224;
export const M2_PER_HECTARE = 10000;
export const M_PER_YARD = 0.9144;

export function celsiusToFahrenheit(celsius: number) {
  return (celsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit: number) {
  return ((fahrenheit - 32) * 5) / 9;
}

export type DataUnit = "B" | "KB" | "MB" | "GB";

export function dataFactor(unit: DataUnit, base: 1000 | 1024) {
  const power = { B: 0, KB: 1, MB: 2, GB: 3 }[unit];
  return base ** power;
}

export function convertData(value: number, from: DataUnit, to: DataUnit, base: 1000 | 1024) {
  return (value * dataFactor(from, base)) / dataFactor(to, base);
}
