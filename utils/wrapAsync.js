module.exports = function (fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};
//wrapAsync is used to handle th errors in the middleware without using try catch

