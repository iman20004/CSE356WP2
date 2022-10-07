const jwt = require("jsonwebtoken")

function authManager() {
    
    verify = function (req, res, next) {
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({
                    status: 'ERROR'
                })
            }

            const verified = jwt.verify(token, ":r(4[CaQ3`N<#8EV~7<K75Rd/ZpfzBkv`m-x]+QnjQcXazr%w")
            req.userId = verified.userId;

            next();
        } catch (err) {
            console.error(err);
            return res.status(401).json({
                status: 'ERROR'
            });
        }
    }

    signToken = function (user) {
        return jwt.sign({
            userId: user._id
        }, ":r(4[CaQ3`N<#8EV~7<K75Rd/ZpfzBkv`m-x]+QnjQcXazr%w");
    }

    return this;
}

const auth = authManager();
module.exports = auth;