module.exports = function (req, res, next) {
    if (req.session.user && req.session.user.is_admin) {
        return next();
    }
    return res.status(403).send("Access denied. Admins only.");
};