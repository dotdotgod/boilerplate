import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function NoHtml(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'noHtml',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return true; // Skip validation if not a string
          }

          // Check for common HTML tags and script patterns
          const htmlPattern = /<\/?[a-z][\s\S]*>/i;
          const scriptPattern = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
          const eventHandlerPattern = /on\w+\s*=\s*["'][^"']*["']/gi;
          const javascriptProtocolPattern = /javascript:/gi;

          return (
            !htmlPattern.test(value) &&
            !scriptPattern.test(value) &&
            !eventHandlerPattern.test(value) &&
            !javascriptProtocolPattern.test(value)
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must not contain HTML or script content`;
        },
      },
    });
  };
}
