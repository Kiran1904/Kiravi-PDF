import { cn } from "@/lib/utils";

/** Native form controls, styled to match shadcn inputs. Native = accessible and zero JS. */
export const selectClass =
  "border-input bg-background focus-visible:border-brand focus-visible:ring-brand/30 h-10 w-full rounded-lg border px-3 text-sm shadow-xs focus-visible:ring-4 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export const rangeClass =
  "accent-brand h-2 w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

export function Field({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}

/** A group of radio cards; `name` keeps them one keyboard group. */
export function RadioCards<T extends string>({
  name,
  legend,
  value,
  onChange,
  options,
  disabled = false,
}: {
  name: string;
  legend: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; description?: string }[];
  disabled?: boolean;
}) {
  return (
    <fieldset disabled={disabled} className="space-y-2">
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "bg-card has-checked:border-brand has-checked:bg-brand-muted/60 has-focus-visible:ring-brand/40 flex cursor-pointer gap-3 rounded-xl border p-3 text-sm has-focus-visible:ring-4",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="accent-brand mt-0.5 size-4 shrink-0"
            />
            <span>
              <span className="block font-medium">{option.label}</span>
              {option.description && (
                <span className="text-muted-foreground mt-0.5 block text-xs">{option.description}</span>
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
