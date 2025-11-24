/**
 * Form Validation Utilities
 * Common validation functions for forms
 */

export type ValidationResult = {
    valid: boolean;
    error?: string;
};

export const validators = {
    /**
     * Required field validator
     */
    required: (value: any): ValidationResult => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            return { valid: false, error: 'This field is required' };
        }
        return { valid: true };
    },

    /**
     * Email validator
     */
    email: (value: string): ValidationResult => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return { valid: false, error: 'Invalid email address' };
        }
        return { valid: true };
    },

    /**
     * Minimum length validator
     */
    minLength: (min: number) => (value: string): ValidationResult => {
        if (value.length < min) {
            return { valid: false, error: `Minimum ${min} characters required` };
        }
        return { valid: true };
    },

    /**
     * Maximum length validator
     */
    maxLength: (max: number) => (value: string): ValidationResult => {
        if (value.length > max) {
            return { valid: false, error: `Maximum ${max} characters allowed` };
        }
        return { valid: true };
    },

    /**
     * Number validator
     */
    number: (value: any): ValidationResult => {
        if (isNaN(Number(value))) {
            return { valid: false, error: 'Must be a valid number' };
        }
        return { valid: true };
    },

    /**
     * Positive number validator
     */
    positive: (value: number): ValidationResult => {
        if (value < 0) {
            return { valid: false, error: 'Must be a positive number' };
        }
        return { valid: true };
    },

    /**
     * Integer validator
     */
    integer: (value: number): ValidationResult => {
        if (!Number.isInteger(value)) {
            return { valid: false, error: 'Must be a whole number' };
        }
        return { valid: true };
    },

    /**
     * Range validator
     */
    range: (min: number, max: number) => (value: number): ValidationResult => {
        if (value < min || value > max) {
            return { valid: false, error: `Must be between ${min} and ${max}` };
        }
        return { valid: true };
    },

    /**
     * SKU format validator
     */
    sku: (value: string): ValidationResult => {
        if (value.length < 3) {
            return { valid: false, error: 'SKU must be at least 3 characters' };
        }
        if (!/^[A-Z0-9-]+$/i.test(value)) {
            return { valid: false, error: 'SKU can only contain letters, numbers, and hyphens' };
        }
        return { valid: true };
    },

    /**
     * Phone number validator
     */
    phone: (value: string): ValidationResult => {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
            return { valid: false, error: 'Invalid phone number' };
        }
        return { valid: true };
    },

    /**
     * URL validator
     */
    url: (value: string): ValidationResult => {
        try {
            new URL(value);
            return { valid: true };
        } catch {
            return { valid: false, error: 'Invalid URL' };
        }
    },
};

/**
 * Validate multiple fields
 */
export function validateForm(
    fields: Record<string, any>,
    rules: Record<string, Array<(value: any) => ValidationResult>>
): Record<string, string> {
    const errors: Record<string, string> = {};

    for (const [field, value] of Object.entries(fields)) {
        const fieldRules = rules[field] || [];

        for (const rule of fieldRules) {
            const result = rule(value);
            if (!result.valid) {
                errors[field] = result.error || 'Invalid value';
                break; // Stop at first error for this field
            }
        }
    }

    return errors;
}
