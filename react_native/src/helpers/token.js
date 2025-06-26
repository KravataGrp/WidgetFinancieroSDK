"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKey = void 0;
const generateKey = (size) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < size; i++) {
        key += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return key;
};
exports.generateKey = generateKey;
