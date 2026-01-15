import { NextRequest, NextResponse } from 'next/server';
import type { PublishRequest } from '@/lib/types';

/**
 * Publish endpoint - Journey 发布时调用
 * 用于在 Journey 激活前进行最终验证或准备工作
 */
export async function POST(request: NextRequest) {
  try {
    const body: PublishRequest = await request.json();

    console.log('Publish request received:', JSON.stringify(body, null, 2));

    // 在这里可以执行发布前的准备工作
    // 例如：
    // 1. 验证外部服务连接
    // 2. 预热缓存
    // 3. 初始化资源

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: 'Activity published successfully',
    });
  } catch (error) {
    console.error('Publish endpoint error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to publish activity',
      },
      { status: 200 }
    );
  }
}

// 处理 OPTIONS 请求（CORS 预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
