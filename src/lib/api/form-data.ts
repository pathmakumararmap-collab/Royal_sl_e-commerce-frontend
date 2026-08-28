/**
 * Laravel (via PHP) only populates $_FILES for native POST requests, so
 * multipart updates must be sent as POST with a `_method` override field
 * rather than a real HTTP PUT/PATCH.
 */
function appendFormValue(formData: FormData, key: string, value: unknown): void {
  if (value === undefined || value === null) return;

  if (value instanceof File || value instanceof Blob) {
    formData.append(key, value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => appendFormValue(formData, `${key}[${index}]`, item));
    return;
  }

  if (typeof value === "boolean") {
    formData.append(key, value ? "1" : "0");
    return;
  }

  if (typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([subKey, subValue]) =>
      appendFormValue(formData, `${key}[${subKey}]`, subValue)
    );
    return;
  }

  formData.append(key, String(value));
}

export function buildFormData<T extends object>(
  input: T,
  method?: "PUT" | "PATCH"
): FormData {
  const formData = new FormData();

  if (method) {
    formData.append("_method", method);
  }

  Object.entries(input).forEach(([key, value]) => appendFormValue(formData, key, value));

  return formData;
}
