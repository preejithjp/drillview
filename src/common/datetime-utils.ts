type ComparisonType = 'day' | 'month' | 'year' | 'date' | 'time' | 'datetime';

export class DateTimeUtils {
  static toLocalDatetime(timestamp: number | string, format: string) {
    if (!timestamp || isNaN(Number(timestamp)) || !format) {
      return timestamp;
    }
    timestamp = Number(timestamp);
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const hours24 = date.getHours();
    const hours12 = hours24 % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const amPm = hours24 >= 12 ? 'PM' : 'AM';

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthShort = monthNames[date.getMonth()].slice(0, 3);
    const monthFull = monthNames[date.getMonth()];

    return format
      .replace('yyyy', year.toString())
      .replace('mm', month)
      .replace('dd', day)
      .replace('hh', String(hours12).padStart(2, '0'))
      .replace('HH', String(hours24).padStart(2, '0'))
      .replace('mi', minutes)
      .replace('ss', seconds)
      .replace('am', amPm.toLowerCase())
      .replace('AM', amPm)
      .replace('Month', monthFull)
      .replace('Mon', monthShort);
  }

  static isSame(timestamp1: number, timestamp2: number, comparisonType: ComparisonType = 'date'): boolean {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);

    switch (comparisonType) {
      case 'day':
        return date1.getDate() === date2.getDate();

      case 'month':
        return date1.getMonth() === date2.getMonth();

      case 'year':
        return date1.getFullYear() === date2.getFullYear();

      case 'date': // Full date (day, month, year)
        return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();

      case 'time': // Compare hour and minute
        return date1.getHours() === date2.getHours() && date1.getMinutes() === date2.getMinutes();

      case 'datetime': // Compare full date and time
        return (
          date1.getFullYear() === date2.getFullYear() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getDate() === date2.getDate() &&
          date1.getHours() === date2.getHours() &&
          date1.getMinutes() === date2.getMinutes()
        );
    }
  }
}
