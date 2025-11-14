export function useValidation() {
  const validateInput = (value: string, regexPattern: string | RegExp): boolean => {
    const regex = regexPattern instanceof RegExp ? regexPattern : new RegExp(regexPattern);
    return regex.test(value);
  };

  return { validateInput };
}
