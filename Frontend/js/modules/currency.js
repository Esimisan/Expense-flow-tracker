//currency.js — ExpenseFlow

import { getSettings } from "./storage.js";

export const CURRENCY_SYMBOLS = {
  AED: "د.إ",
  AFN: "؋",
  ALL: "L",
  AMD: "֏",
  ARS: "$",
  AUD: "A$",
  AZN: "₼",
  BAM: "KM",
  BDT: "৳",
  BGN: "лв",
  BHD: ".د.ب",
  BND: "B$",
  BOB: "Bs.",
  BRL: "R$",
  BWP: "P",
  BYN: "Br",
  BZD: "BZ$",
  CAD: "C$",
  CHF: "Fr",
  CLP: "$",
  CNY: "¥",
  COP: "$",
  CRC: "₡",
  CZK: "Kč",
  DKK: "kr",
  DOP: "RD$",
  DZD: "دج",
  EGP: "£",
  ETB: "Br",
  EUR: "€",
  GBP: "£",
  GEL: "₾",
  GHS: "₵",
  GTQ: "Q",
  HKD: "HK$",
  HNL: "L",
  HRK: "kn",
  HUF: "Ft",
  IDR: "Rp",
  ILS: "₪",
  INR: "₹",
  IQD: "ع.د",
  IRR: "﷼",
  ISK: "kr",
  JMD: "J$",
  JOD: "JD",
  JPY: "¥",
  KES: "KSh",
  KGS: "лв",
  KHR: "៛",
  KRW: "₩",
  KWD: "KD",
  KZT: "₸",
  LBP: "£",
  LKR: "₨",
  LYD: "LD",
  MAD: "MAD",
  MDL: "L",
  MMK: "K",
  MUR: "₨",
  MXN: "$",
  MYR: "RM",
  MZN: "MT",
  NAD: "N$",
  NGN: "₦",
  NOK: "kr",
  NPR: "₨",
  NZD: "NZ$",
  OMR: "﷼",
  PAB: "B/.",
  PEN: "S/",
  PHP: "₱",
  PKR: "₨",
  PLN: "zł",
  QAR: "﷼",
  RON: "lei",
  RSD: "din",
  RUB: "₽",
  SAR: "﷼",
  SEK: "kr",
  SGD: "S$",
  THB: "฿",
  TND: "DT",
  TRY: "₺",
  TWD: "NT$",
  TZS: "TSh",
  UAH: "₴",
  UGX: "USh",
  USD: "$",
  UYU: "$U",
  UZS: "лв",
  VES: "Bs.S",
  VND: "₫",
  XAF: "FCFA",
  XOF: "CFA",
  YER: "﷼",
  ZAR: "R",
  ZMW: "ZK",
};

// Currency symbol for the signed-in user's chosen currency (defaults to ₦).
export function getCurrencySymbol() {
  const settings = getSettings();
  return (settings && CURRENCY_SYMBOLS[settings.currency]) || "₦";
}

// Full, unabbreviated amount, e.g. "₦12,345.00"
export function formatCurrencyFull(amount) {
  const s = getCurrencySymbol();
  return `${s}${amount.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Abbreviated for tight spaces, e.g. "₦12K", "₦1.2M", "₦3.4B"
export function formatCurrencyAbbr(amount) {
  const s = getCurrencySymbol();
  if (amount >= 1_000_000_000)
    return `${s}${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `${s}${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${s}${(amount / 1_000).toFixed(0)}K`;
  return formatCurrencyFull(amount);
}
