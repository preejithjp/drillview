import { configure, FieldContext } from 'vee-validate';

type ValidationRule = (value: string, params?: unknown[], ctx?: FieldContext) => string | boolean;

const customValidation: Record<string, ValidationRule> = {
  existIn(value: string, params?: unknown[]): string {
    if (!value || !Array.isArray(params)) {
      return '';
    }

    const list = params as string[];
    const exists = list.some((item) => item.toLowerCase().trim() === value.toLowerCase().trim());
    return exists ? `The value ${value} already exists.` : '';
  },
  hasContent(value: string): string {
    if (!value) {
      return 'Please enter text.';
    }
    const trimmedValue = value.trim();
    const hasContent = [...trimmedValue].length > 0;

    return hasContent ? '' : 'Please enter text or emoji.';
  },
  optional(value: string, _params: unknown[] | undefined, ctx?: FieldContext): string {
    if (value === '' || value === null || value === undefined) {
      return '';
    }
    const fieldName = ctx?.name;
    if (typeof value !== 'string') {
      return 'Invalid input';
    }

    return value.trim().length === 0 ? `${fieldName} is not valid.` : '';
  },
};

export default customValidation;

// VeeValidate global message config
configure({
  generateMessage: ({ field, rule }) => {
    const messages: Record<string, string> = {
      required: `${field} is required.`,
    };

    if (rule && rule.name in messages) {
      return messages[rule.name as keyof typeof messages];
    }

    return `${field} is invalid.`;
  },
});
