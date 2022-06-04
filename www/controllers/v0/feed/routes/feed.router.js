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
exports.FeedRouter = void 0;
const express_1 = require("express");
const FeedItem_1 = require("../models/FeedItem");
const auth_router_1 = require("../../users/routes/auth.router");
const AWS = __importStar(require("../../../../aws"));
const router = express_1.Router();
// Get all feed items
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const items = yield FeedItem_1.FeedItem.findAndCountAll({ order: [['id', 'DESC']] });
    items.rows.map((item) => {
        if (item.url) {
            item.url = AWS.getGetSignedUrl(item.url);
        }
    });
    res.send(items);
}));
//@TODO
//Add an endpoint to GET a specific resource by Primary Key
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id } = req.params;
    const item = yield FeedItem_1.FeedItem.findByPk(id);
    if (item == null)
        return res.status(404).send(`Item with id = ${id} does not exit`);
    if (item.url) {
        item.url = AWS.getGetSignedUrl(item.url);
    }
    res.send(item);
}));
// update a specific resource
router.patch('/:id', auth_router_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@TODO try it yourself
    const caption = req.body.caption;
    const fileName = req.body.url;
    let { id } = req.params;
    const item = yield FeedItem_1.FeedItem.findByPk(id);
    if (item == null)
        return res.status(404).send(`Item with id = ${id} does not exit`);
    if (caption)
        item.caption = caption;
    if (fileName)
        item.url = fileName;
    const saved_item = yield item.save();
    saved_item.url = AWS.getGetSignedUrl(saved_item.url);
    res.status(201).send(saved_item);
}));
// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName', auth_router_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { fileName } = req.params;
    const url = AWS.getPutSignedUrl(fileName);
    res.status(201).send({ url: url });
}));
// Post meta data and the filename after a file is uploaded 
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post('/', auth_router_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const caption = req.body.caption;
    const fileName = req.body.url;
    // check Caption is valid
    if (!caption) {
        return res.status(400).send({ message: 'Caption is required or malformed' });
    }
    // check Filename is valid
    if (!fileName) {
        return res.status(400).send({ message: 'File url is required' });
    }
    const item = yield new FeedItem_1.FeedItem({
        caption: caption,
        url: fileName
    });
    const saved_item = yield item.save();
    saved_item.url = AWS.getGetSignedUrl(saved_item.url);
    res.status(201).send(saved_item);
}));
exports.FeedRouter = router;
//# sourceMappingURL=feed.router.js.map