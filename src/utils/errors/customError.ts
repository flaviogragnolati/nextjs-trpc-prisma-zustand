import _ from 'lodash';
import { HttpStatusMessages, HttpStatusCode } from '@/types';

export interface Extra {
  from?: string;
  code?: number;
  description?: string;
  redirectTo?: string;
  adittional?: any;
  error?: Error;
}

class CustomError extends Error {
  public code: number;
  public extra: Extra | null;

  constructor(
    message: string | HttpStatusMessages,
    code: number = HttpStatusCode.internalServerError,
    extra: Extra | null = null,
  ) {
    super(message);
    this.code = code;
    this.extra = extra;
    Error.captureStackTrace(this, this.constructor);
  }

  toJson(additional?: any) {
    const json: { error: string; code: number; extra?: Extra } = {
      error: this.message,
      code: this.code,
    };
    if (this.extra || additional) {
      json.extra = _.merge({}, this.extra || {}, additional || {});
    }
    return json;
  }
}

export default CustomError;
