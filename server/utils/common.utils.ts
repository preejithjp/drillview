export class Utils {
  public static ValueIsInEnum<E>(value: string | number, enumeration: Record<string | number | symbol, E>): boolean {
    if (typeof value === 'number') {
      return value in enumeration;
    } else {
      return Object.values(enumeration).includes(value as E);
    }
  }
}
