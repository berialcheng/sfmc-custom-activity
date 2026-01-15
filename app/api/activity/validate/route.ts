import { NextRequest, NextResponse } from 'next/server';
import type { ValidateRequest } from '@/lib/types';

/**
 * Validate endpoint - 验证 Activity 配置
 * 在用户尝试保存或发布时被调用
 */
export async function POST(request: NextRequest) {
  try {
    const body: ValidateRequest = await request.json();

    console.log('Validate request received:', JSON.stringify(body, null, 2));

    // 在这里执行配置验证
    // 例如：
    // 1. 检查必填字段
    // 2. 验证 API 密钥
    // 3. 测试外部服务连接

    const errors: string[] = [];

    // 示例验证逻辑
    // 如果有配置错误，添加到 errors 数组
    // if (!body.configurationArguments?.someRequiredField) {
    //   errors.push('Some required field is missing');
    // }

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        errors,
        message: 'Validation failed',
      });
    }

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: 'Activity configuration is valid',
    });
  } catch (error) {
    console.error('Validate endpoint error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Validation failed due to server error',
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
