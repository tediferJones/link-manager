// FIX ME
// clean up types (especially casting)
// move to @/shared
//  - this will also be used in @/app

type Validator<T> = { match: T, error: string }

type Validators = {
  required: Validator<boolean>,
  pattern: Validator<RegExp>,
  minLength: Validator<number>,
};

type InputNames = 'email' | 'password'

type ValidationMethods = {
  [K in keyof Validators]: (input: string, expected: Validators[K]['match']) => boolean
}

type Inputs = Partial<{ [K in InputNames]: string }>

const validators: { [K in InputNames]: Partial<Validators> } = {
  email: {
    required: {
      match: true,
      error: 'Email is required',
    },
    pattern: {
      match: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/,
      error: 'Email is not formatted correctly',
    }
  },
  password: {
    required: {
      match: true,
      error: 'Password is required',
    },
    pattern: {
      match: /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/,
      error: 'Password must contain at least one capital letter and one special character',
    },
    minLength: {
      match: 8,
      error: 'Password must be at least 8 characters long',
    }
  },
} as const;

const validationMethods: ValidationMethods = {
  required: (input, expected) => !expected ? true : !!input === expected,
  pattern: (input, expected) => expected.test(input),
  minLength: (input, expected) => input.length >= expected,
}

export function inlineValidation(inputName: InputNames) {
  // FIX ME use getTypeKeys
  return (Object.keys(validators[inputName]) as (keyof Validators)[]).reduce((obj, constraint) => {
    obj[constraint] = validators[inputName][constraint]?.match;
    return obj;
  }, {} as { [key: string]: any });
}

function returnTruthy<T>(keys: T[], func: (arg: T) => any, i = 0) {
  const key = keys[i];
  if (!key) return;
  const result = func(key);
  if (result) return result;
  return returnTruthy(keys, func, i + 1);
}

export function validate(inputs: Inputs) {
  // FIX ME use getTypeKeys
  return returnTruthy(Object.keys(inputs) as InputNames[], (inputName) => {
    const value = inputs[inputName];
    const constraints = validators[inputName];
    return returnTruthy(
      // FIX ME use getTypeKeys
      Object.keys(constraints) as (keyof typeof constraints)[],
      (constraintType) => {
        const attributes = validators[inputName][constraintType];
        if (!attributes) throw Error('improve these types');
        const validationResult = validationMethods[constraintType](
          value as any,
          attributes.match as never
        );
        if (!validationResult) return attributes.error;
      }
    );
  });
}
