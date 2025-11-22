export function validateField(
    value: string,
    fieldName: string,
    regex?: RegExp
  ) {
    // 1. Empty check
    if (!value || value.trim() === "") {
      return `${fieldName} cannot be left blank`;
    }
    // 2. Regex check (only if regex provided)
    if (regex && !regex.test(value)) {
      return `${fieldName} is not in correct format`;
    }
  
    return ""; // Means no errors
  }
  