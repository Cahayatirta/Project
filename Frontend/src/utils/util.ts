export function initials(name: string): string {
  const cleanedName = name.replace(/[^\p{L}\s]/gu, '');
  const words = cleanedName.trim().split(/\s+/);
  if (words.length === 0 || words[0] === '') {
    return '';
  }
  return (words[0].charAt(0) + (words.length > 1 ? words[1].charAt(0) : '')).toUpperCase()
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createDateFromRawDate(rawDate: string) {
  const [year, month, date] = rawDate.split("-").map(Number);
  return new Date(year, month - 1, date);
}