import { useMemo, useId } from "react";

const COMMON_EMAIL_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "live.com",
];

export default function EmailAutocompleteInput({
  id,
  name,
  value,
  onChange,
  className,
  style,
  placeholder = "you@example.com",
  autoComplete = "email",
  required,
  inputMode = "email",
  ariaRequired,
  ariaInvalid,
  ariaDescribedby,
}) {
  const autoId = useId();
  const dataListId = `${id || autoId}-email-suggestions`;

  const suggestions = useMemo(() => {
    const trimmed = (value || "").trim();
    if (!trimmed) return [];

    const atIndex = trimmed.indexOf("@");
    if (atIndex === -1) {
      if (trimmed.length < 2) return [];
      return COMMON_EMAIL_DOMAINS.map((domain) => `${trimmed}@${domain}`);
    }

    const localPart = trimmed.slice(0, atIndex).trim();
    const domainPart = trimmed.slice(atIndex + 1).trim().toLowerCase();
    if (!localPart) return [];

    return COMMON_EMAIL_DOMAINS
      .filter((domain) => domain.startsWith(domainPart))
      .map((domain) => `${localPart}@${domain}`);
  }, [value]);

  return (
    <>
      <input
        id={id}
        name={name}
        type="email"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        style={style}
        autoComplete={autoComplete}
        required={required}
        inputMode={inputMode}
        list={dataListId}
        aria-required={ariaRequired}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
      />
      {suggestions.length > 0 && (
        <datalist id={dataListId}>
          {suggestions.slice(0, 6).map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      )}
    </>
  );
}
