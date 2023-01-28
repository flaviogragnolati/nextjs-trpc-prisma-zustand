import _ from 'lodash';
import CustomError, { Extra } from './customError';
import { HttpStatusCode } from '@/types';

const defaultFromOptions = {
  error: 'InternalServerError',
  message: 'Internal Server Error',
  code: HttpStatusCode.internalServerError,
  extra: {},
};

const From = (
  error: Error | InstanceType<typeof CustomError>,
  fromOptions?: typeof defaultFromOptions,
) => {
  const options = _.defaultsDeep(
    fromOptions,
    defaultFromOptions,
  ) as typeof defaultFromOptions;

  if (error instanceof CustomError) {
    const code = error.code || options.code;
    const message = error.message || options.message;
    const extra = _.merge({}, options.extra, error.extra);
    return new CustomError(message, code, extra);
  }

  return new CustomError(options.message, options.code, options.extra);
};

class BadRequest extends CustomError {
  constructor(message = 'Bad Request', extra?: Extra) {
    super(message, HttpStatusCode.badRequest, extra);
  }
}

class Unauthorized extends CustomError {
  constructor(message = 'Unauthorized', extra?: Extra) {
    super(message, HttpStatusCode.unauthorized, extra);
  }
}

class Forbidden extends CustomError {
  constructor(message = 'Forbidden', extra?: Extra) {
    super(message, HttpStatusCode.forbidden, extra);
  }
}

class NotFound extends CustomError {
  constructor(message = 'Not Found', extra?: Extra) {
    super(message, HttpStatusCode.notFound, extra);
  }
}

class NotAcceptable extends CustomError {
  constructor(message = 'Not Acceptable', extra?: Extra) {
    super(message, HttpStatusCode.notAcceptable, extra);
  }
}

class RequestTimeout extends CustomError {
  constructor(message = 'Request Timeout', extra?: Extra) {
    super(message, HttpStatusCode.requestTimeout, extra);
  }
}

class PreconditionFailed extends CustomError {
  constructor(message = 'Precondition Failed', extra?: Extra) {
    super(message, HttpStatusCode.preconditionFailed, extra);
  }
}

class PayloadTooLarge extends CustomError {
  constructor(message = 'Payload TooLarge', extra?: Extra) {
    super(message, HttpStatusCode.payloadTooLarge, extra);
  }
}

class UriTooLong extends CustomError {
  constructor(message = 'Uri Too Long', extra?: Extra) {
    super(message, HttpStatusCode.uriTooLong, extra);
  }
}

class ImATeapot extends CustomError {
  constructor(message = "I'm a Teapot", extra?: Extra) {
    super(message, HttpStatusCode.iAmATeapot, extra);
  }
}

class Locked extends CustomError {
  constructor(message = 'Locked', extra?: Extra) {
    super(message, HttpStatusCode.locked, extra);
  }
}

class FailedDependency extends CustomError {
  constructor(message = 'Failed Dependency', extra?: Extra) {
    super(message, HttpStatusCode.failedDependency, extra);
  }
}

class PreconditionRequired extends CustomError {
  constructor(message = 'Precondition Required', extra?: Extra) {
    super(message, HttpStatusCode.preconditionFailed, extra);
  }
}

class TooManyRequests extends CustomError {
  constructor(message = 'Too Many Requests', extra?: Extra) {
    super(message, HttpStatusCode.tooManyRequests, extra);
  }
}

class TokenInvalid extends CustomError {
  constructor(message = 'Token Invalid', extra?: Extra) {
    super(message, HttpStatusCode.tokenInvalid, extra);
  }
}
class TokenRequired extends CustomError {
  constructor(message = 'Token Required', extra?: Extra) {
    super(message, HttpStatusCode.tokenRequired, extra);
  }
}

class InternalServerError extends CustomError {
  constructor(message = 'Internal Server Error', extra?: Extra) {
    super(message, HttpStatusCode.internalServerError, extra);
  }
}

class NotImplemented extends CustomError {
  constructor(message = 'Not Implemented', extra?: Extra) {
    super(message, HttpStatusCode.notImplemented, extra);
  }
}

class BadGateway extends CustomError {
  constructor(message = 'Bad Gateway', extra?: Extra) {
    super(message, HttpStatusCode.badGateway, extra);
  }
}

class ServiceUnavailable extends CustomError {
  constructor(message = 'Service Unavailable', extra?: Extra) {
    super(message, HttpStatusCode.serviceUnavailable, extra);
  }
}

class GatewayTimeout extends CustomError {
  constructor(message = 'Gateway Timeout', extra?: Extra) {
    super(message, HttpStatusCode.gatewayTimeout, extra);
  }
}

class NotExtended extends CustomError {
  constructor(message = 'Not Extended', extra?: Extra) {
    super(message, HttpStatusCode.notExtended, extra);
  }
}

class NetworkAuthenticationRequired extends CustomError {
  constructor(message = 'Network Authentication Required', extra?: Extra) {
    super(message, HttpStatusCode.networkAuthenticationRequired, extra);
  }
}

const Errors = {
  From,
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  NotAcceptable,
  RequestTimeout,
  PreconditionFailed,
  PayloadTooLarge,
  UriTooLong,
  ImATeapot,
  Locked,
  FailedDependency,
  PreconditionRequired,
  TooManyRequests,
  TokenInvalid,
  TokenRequired,
  InternalServerError,
  NotImplemented,
  BadGateway,
  ServiceUnavailable,
  GatewayTimeout,
  NotExtended,
  NetworkAuthenticationRequired,
};

export default Errors;
