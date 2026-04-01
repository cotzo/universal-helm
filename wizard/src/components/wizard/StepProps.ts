export interface StepProps {
  values: Record<string, unknown>
  getValue: (path: string) => unknown
  setValue: (path: string, value: unknown) => void
}
