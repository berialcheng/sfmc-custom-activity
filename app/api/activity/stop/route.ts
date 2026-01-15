import { NextRequest, NextResponse } from 'next/server';
import type { StopRequest } from '@/lib/types';

/**
 * Stop endpoint - Journey 停止时调用
 * 用于清理资源、取消待处理任务等
 */
export async function POST(request: NextRequest) {
  try {
    const body: StopRequest = await request.json();

    console.log('Stop request received:', JSON.stringify(body, null, 2));

    // 在这里执行清理工作
    // 例如：
    // 1. 取消待处理的异步任务
    // 2. 清理临时资源
    // 3. 记录 Journey 停止日志

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: 'Activity stopped successfully',
    });
  } catch (error) {
    console.error('Stop endpoint error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to stop activity',
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
