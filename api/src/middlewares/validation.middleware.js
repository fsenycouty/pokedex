import HttpError from "../utils/HttpError.js";

export function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      throw new HttpError(error.details[0].message, 400);
    }
    next();
  };
}