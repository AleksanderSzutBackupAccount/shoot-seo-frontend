import type { ValidationErrorBody } from '~~/shared/types/api'

export interface ApiFieldError {
  name: string
  message: string
}

export interface ParsedApiError {
  message: string
  /** Field-level errors, shaped for `UForm.setErrors()`. */
  fieldErrors: ApiFieldError[]
}

/**
 * Normalises an error thrown by `$fetch` (against the BFF) into a top-level
 * message plus per-field errors sourced from Laravel's 422 `{ message, errors }`.
 */
export function parseApiError(error: unknown): ParsedApiError {
  const data = (error as { data?: ValidationErrorBody })?.data
  const { $i18n } = useNuxtApp()
  const message
    = data?.message
      || (error as { statusMessage?: string })?.statusMessage
      || (error as Error)?.message
      || $i18n.t('common.unexpectedError')

  const fieldErrors: ApiFieldError[] = []
  if (data?.errors) {
    for (const [name, messages] of Object.entries(data.errors)) {
      if (Array.isArray(messages) && messages.length > 0) {
        fieldErrors.push({ name, message: messages[0]! })
      }
    }
  }

  return { message, fieldErrors }
}
