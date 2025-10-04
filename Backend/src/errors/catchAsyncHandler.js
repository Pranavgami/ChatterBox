export const catchAsyncHandler = (req, res, next) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => next(error));
  };
};
