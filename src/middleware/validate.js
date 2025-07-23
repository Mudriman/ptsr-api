import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const formatted = fromZodError(err);
      res.status(400).json({
        error: 'Validation failed',
        details: formatted.toString(),
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
