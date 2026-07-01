import { haptic } from "@/lib/haptics";

// iOS uslubidagi toggle
export function Switch({
  checked,
  onChange,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      data-on={checked}
      onClick={() => {
        haptic("select");
        onChange(!checked);
      }}
      className="ios-switch tap"
    />
  );
}
