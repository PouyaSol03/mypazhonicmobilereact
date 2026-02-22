const ENGLISH_DIGITS_REGEX = /\d/g

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]

export const toPersianDigits = (value: string | number): string => {
  return String(value).replace(ENGLISH_DIGITS_REGEX, (digit) => {
    return PERSIAN_DIGITS[Number(digit)]
  })
}
