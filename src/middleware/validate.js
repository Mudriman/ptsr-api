import { fromZodError } from 'zod-validation-error';

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    res.status(400).json({ 
      error: 'Validation failed',
      details: fromZodError(err).toString() 
    });
  }
};