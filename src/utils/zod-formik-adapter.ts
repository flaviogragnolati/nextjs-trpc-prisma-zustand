import { z } from 'zod';

/**
 * Ported from
 * @author Robert Lichtnow
 * @link https://github.com/robertLichtnow/zod-formik-adapter
 */

export class ValidationError extends Error {
  public name = 'ValidationError';

  public inner: Array<{ path: string; message: string }> = [];

  public constructor(message: string) {
    super(message);
  }
}

function createValidationError(e: z.ZodError) {
  const error = new ValidationError(e.message);
  error.inner = e.errors.map((err) => ({
    message: err.message,
    path: err.path.join('.'),
  }));

  return error;
}

/**
 * Wrap your zod schema in this function when providing it to Formik's validation schema prop
 * @param schema The zod schema
 * @returns An object containing the `validate` method expected by Formik
 */
export function toFormikValidationSchema<T>(
  schema: z.ZodSchema<T>,
  params?: Partial<z.ParseParams>,
): { validate: (obj: T) => Promise<void> } {
  return {
    async validate(obj: T) {
      try {
        await schema.parseAsync(obj, params);
      } catch (err: unknown) {
        throw createValidationError(err as z.ZodError<T>);
      }
    },
  };
}

function createValidationResult(error: z.ZodError) {
  const result: Record<string, string> = {};

  for (const x of error.errors) {
    result[x.path.filter(Boolean).join('.')] = x.message;
  }

  return result;
}

/**
 * Wrap your zod schema in this function when providing it to Formik's validate prop
 * @param schema The zod schema
 * @returns An validate function as expected by Formik
 */
export function toFormikValidate<T>(
  schema: z.ZodSchema<T>,
  params?: Partial<z.ParseParams>,
) {
  return async (values: T) => {
    const result = await schema.safeParseAsync(values, params);
    if (!result.success) {
      return createValidationResult(result.error);
    }
  };
}

/**
 * @example
 * import React from 'react';
 * import { Formik } from 'formik';
 * import { z } from 'zod';
 * import { toFormikValidationSchema } from '/@utils/zod-formik-adapter';
 *
 * const Schema = z.object({
 *   name: z.string(),
 *   age: z.number(),
 * });
 *
 * const initialValues = {
 *   name: "",
 *   age: 1,
 * }
 *
 * export const SampleForm = () => (
 *   <Formik
 *     initialValues={initialValues}
 *     validationSchema={toFormikValidationSchema(Schema)}
 *     onSubmit={console.log}
 *   >
 *     {({ errors, values, handleChange }) => (
 *       <form>
 *         <input value={values.name} onChange={handleChange("name")} />
 *         <span>{errors.name}</span>
 *
 *         <input value={values.age} onChange={handleChange("age")} />
 *         <span>{errors.age}</span>
 *       </form>
 *     )}
 *   </Formik>
 * );
 */
