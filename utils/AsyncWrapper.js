const AsyncWrapper = (cb) => (req, res, next) => {
  Promise.resolve(cb(req, res, next)).catch(next);
};

module.exports = AsyncWrapper;
