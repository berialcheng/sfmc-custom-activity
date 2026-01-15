import { NextRequest, NextResponse } from 'next/server';
import type { SaveRequest } from '@/lib/types';

/**
 * Save endpoint - 用户在 Journey Builder 中保存 Activity 配置时调用
 */
export async function POST(request: NextRequest) {
  try {
    const body: SaveRequest = await request.json();

    console.log('Save request received:', JSON.stringify(body, null, 2));

    // 在这里可以将配置保存到数据库或其他存储
    // 通常 SFMC 会在 Activity 的 arguments 中保存配置
    // 所以大多数情况下不需要额外的服务端存储

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: 'Activity configuration saved successfully',
    });
  } catch (error) {
    console.error('Save endpoint error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to save activity configuration',
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
