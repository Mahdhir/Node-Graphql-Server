const jwt = require('jsonwebtoken')
const isAuth = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        // return failAuth.bind(this,req);
        req.isAuth = false;
        return next();
    }
    const token = authHeader.split(' ')[1]
    if (!token || token === '') {
        // return failAuth.bind(this,req);
        req.isAuth = false;
        return next();
    }
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    } catch (error) {
        // return failAuth.bind(this,req);
        req.isAuth = false;
        return next();
    }
    if (!decodedToken) {
        // return failAuth.bind(this,req);
        req.isAuth = false;
        return next();
    }
    req.isAuth = true;
    req.userId = decodedToken.userId;
    next();
}

const failAuth = (req) => {
    req.isAuth = false;
    return next();
}

module.exports = isAuth;