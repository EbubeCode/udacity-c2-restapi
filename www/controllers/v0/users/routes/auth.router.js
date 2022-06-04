"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = exports.requireAuth = void 0;
const express_1 = require("express");
const User_1 = require("../models/User");
const jwt = __importStar(require("jsonwebtoken"));
const EmailValidator = __importStar(require("email-validator"));
const config_1 = require("../../../../config/config");
const router = express_1.Router();
function generatePassword(plainTextPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        //@TODO Use Bcrypt to Generated Salted Hashed Passwords
        return "NotYetImplemented";
    });
}
function comparePasswords(plainTextPassword, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        //@TODO Use Bcrypt to Compare your password to your Salted Hashed Password
        return true;
    });
}
function generateJWT(user) {
    //@TODO Use jwt to create a new JWT Payload containing
    return jwt.sign(user.toJSON(), config_1.config.jwt.secret);
}
function requireAuth(req, res, next) {
    console.warn("auth.router not yet implemented, you'll cover this in lesson 5");
    return next();
    // if (!req.headers || !req.headers.authorization){
    //     return res.status(401).send({ message: 'No authorization headers.' });
    // }
    // const token_bearer = req.headers.authorization.split(' ');
    // if(token_bearer.length != 2){
    //     return res.status(401).send({ message: 'Malformed token.' });
    // }
    // const token = token_bearer[1];
    // return jwt.verify(token, "hello", (err, decoded) => {
    //   if (err) {
    //     return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });
    //   }
    //   return next();
    // });
}
exports.requireAuth = requireAuth;
router.get('/verification', requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).send({ auth: true, message: 'Authenticated.' });
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    // check email is valid
    if (!email || !EmailValidator.validate(email)) {
        return res.status(400).send({ auth: false, message: 'Email is required or malformed' });
    }
    // check email password valid
    if (!password) {
        return res.status(400).send({ auth: false, message: 'Password is required' });
    }
    const user = yield User_1.User.findByPk(email);
    // check that user exists
    if (!user) {
        return res.status(401).send({ auth: false, message: 'Unauthorized' });
    }
    // check that the password matches
    const authValid = yield comparePasswords(password, user.password_hash);
    if (!authValid) {
        return res.status(401).send({ auth: false, message: 'Unauthorized' });
    }
    // Generate JWT
    const jwt = generateJWT(user);
    res.status(200).send({ auth: true, token: jwt, user: user.short() });
}));
//register a new user
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const plainTextPassword = req.body.password;
    // check email is valid
    if (!email || !EmailValidator.validate(email)) {
        return res.status(400).send({ auth: false, message: 'Email is required or malformed' });
    }
    // check email password valid
    if (!plainTextPassword) {
        return res.status(400).send({ auth: false, message: 'Password is required' });
    }
    // find the user
    const user = yield User_1.User.findByPk(email);
    // check that user doesnt exists
    if (user) {
        return res.status(422).send({ auth: false, message: 'User may already exist' });
    }
    const password_hash = yield generatePassword(plainTextPassword);
    const newUser = yield new User_1.User({
        email: email,
        password_hash: password_hash
    });
    let savedUser;
    try {
        savedUser = yield newUser.save();
    }
    catch (e) {
        throw e;
    }
    // Generate JWT
    const jwt = generateJWT(savedUser);
    res.status(201).send({ token: jwt, user: savedUser.short() });
}));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send('auth');
}));
exports.AuthRouter = router;
//# sourceMappingURL=auth.router.js.map