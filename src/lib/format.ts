import type { GenderType, ScentFamily } from './types';

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

export function normalizeDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

export function formatNumberFa(value: number): string {
  const formatted = Math.round(value).toLocaleString('en-US');
  return toPersianDigits(formatted);
}

export function formatToman(value: number): string {
  if (value <= 0) {
    return 'رایگان';
  }
  return `${formatNumberFa(value)} تومان`;
}

export function formatPricePerMl(priceToman: number, volumeMl: number): string {
  if (!volumeMl || volumeMl <= 0) return '';
  const perMl = Math.round(priceToman / volumeMl);
  return `${formatNumberFa(perMl)} تومان / میل`;
}

export function formatDateFa(isoDate: string): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

export function getGenderLabelFa(gender: GenderType): string {
  switch (gender) {
    case 'men':
      return 'مردانه';
    case 'women':
      return 'زنانه';
    case 'unisex':
      return 'یونیسکس (اسپرت)';
  }
}

export function getScentFamilyLabelFa(family: ScentFamily): string {
  switch (family) {
    case 'fresh':
      return 'خنک و شاداب (Fresh)';
    case 'woody':
      return 'چوبی و تلخ (Woody)';
    case 'oriental':
      return 'شرقی و گرم (Oriental)';
    case 'floral':
      return 'گلی و ملایم (Floral)';
  }
}

export function orderStatusLabelFa(status: string): string {
  switch (status) {
    case 'pending_confirmation':
      return 'ثبت شده — در انتظار تأیید';
    case 'processing':
      return 'در حال آماده‌سازی و بسته‌بندی';
    case 'shipped':
      return 'تحویل به پست / ارسال شده';
    case 'delivered':
      return 'تحویل شده به مشتری';
    case 'cancelled':
      return 'لغو شده';
    default:
      return status;
  }
}

export function paymentStatusLabelFa(status: string): string {
  switch (status) {
    case 'pending':
      return 'در انتظار پرداخت';
    case 'receipt_submitted':
      return 'رسید ثبت شد — در انتظار بررسی';
    case 'paid':
      return 'پرداخت تایید شده';
    case 'failed':
      return 'پرداخت ناموفق / لغو';
    default:
      return status;
  }
}

export const IRAN_PROVINCES = [
  'خوزستان',
  'تهران',
  'اصفهان',
  'فارس',
  'خراسان رضوی',
  'البرز',
  'آذربایجان شرقی',
  'مازندران',
  'گیلان',
  'کرمان',
  'هرمزگان',
  'بوشهر',
  'لرستان',
  'کرمانشاه',
  'همدان',
  'یزد',
  'مرکزی',
  'قزوین',
  'قم',
  'گلستان',
  'آذربایجان غربی',
  'کردستان',
  'اردبیل',
  'زنجان',
  'سمنان',
  'چهارمحال و بختیاری',
  'کهگیلویه و بویراحمد',
  'ایلام',
  'خراسان شمالی',
  'خراسان جنوبی',
  'سیستان و بلوچستان',
] as const;
