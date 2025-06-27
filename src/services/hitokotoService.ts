/*
 * @Author       : HCLonely
 * @Date         : 2025-06-27 15:15:15
 * @LastEditTime : 2025-06-27 15:27:04
 * @LastEditors  : HCLonely
 * @FilePath     : /ip-sign/src/services/hitokotoService.ts
 * @Description  : 一言服务
 */

import axios from 'axios';

interface HitokotoResponse {
  id: number;
  uuid: string;
  hitokoto: string;
  type: string;
  from: string;
  from_who: string | null;
  creator: string;
  creator_uid: number;
  reviewer: number;
  commit_from: string;
  created_at: string;
  length: number;
}

export async function getHitokoto(): Promise<string> {
  try {
    const response = await axios.get<HitokotoResponse>('https://v1.hitokoto.cn');
    return response.data.hitokoto;
  } catch (error) {
    console.error('[一言] 获取失败:', error);
    return '世界上黑暗中发的光，这束光就是你内心真正想要的。';
  }
}
