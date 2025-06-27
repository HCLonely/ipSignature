"use strict";
/*
 * @Author       : HCLonely
 * @Date         : 2025-06-27 15:15:15
 * @LastEditTime : 2025-06-27 15:27:04
 * @LastEditors  : HCLonely
 * @FilePath     : /ip-sign/src/services/hitokotoService.ts
 * @Description  : 一言服务
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHitokoto = getHitokoto;
const axios_1 = __importDefault(require("axios"));
async function getHitokoto() {
    try {
        const response = await axios_1.default.get('https://v1.hitokoto.cn');
        return response.data.hitokoto;
    }
    catch (error) {
        console.error('[一言] 获取失败:', error);
        return '世界上黑暗中发的光，这束光就是你内心真正想要的。';
    }
}
