import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import type { ZodType } from "zod";

/**
 * Lightweight React Hook Form resolver for Zod v3 schemas.
 * Avoids the @hookform/resolvers v5.4+ peer dependency mismatch on 'zod/v4/core'
 * when paired with Zod 3.23.x under Next.js 16 Turbopack.
 */
export function zodResolver<TFieldValues extends FieldValues>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: ZodType<any, any, any>
): Resolver<TFieldValues> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return {
        values: result.data as TFieldValues,
        errors: {},
      };
    }

    const fieldErrors: FieldErrors<TFieldValues> = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "root") as keyof TFieldValues;
      if (!fieldErrors[key]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (fieldErrors as Record<string, any>)[key as string] = {
          type: issue.code,
          message: issue.message,
        };
      }
    }

    return {
      values: {} as Record<string, never>,
      errors: fieldErrors,
    };
  };
}

