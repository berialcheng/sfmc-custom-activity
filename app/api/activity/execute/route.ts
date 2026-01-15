import { NextRequest, NextResponse } from 'next/server';
import type { ExecuteRequest, ExecuteResponse } from '@/lib/types';

/**
 * Execute endpoint - Journey Builder 执行 Activity 时调用
 * 这是 Custom Activity 的核心逻辑所在
 */
export async function POST(request: NextRequest) {
  try {
    const body: ExecuteRequest = await request.json();

    console.log('Execute request received:', JSON.stringify(body, null, 2));

    // 从 inArguments 中提取参数
    const inArguments = body.inArguments || [];

    // 将 inArguments 数组转换为对象便于访问
    const args: Record<string, unknown> = {};
    inArguments.forEach((arg) => {
      Object.entries(arg).forEach(([key, value]) => {
        args[key] = value;
      });
    });

    // 获取配置的参数
    const contactKey = args.contactKey as string;
    const emailAddress = args.emailAddress as string;
    const customField1 = args.customField1 as string;
    const customField2 = args.customField2 as string;

    console.log('Extracted arguments:', {
      contactKey,
      emailAddress,
      customField1,
      customField2,
    });

    // ========================================
    // 在这里添加您的自定义业务逻辑
    // 例如：调用外部 API、处理数据、发送通知等
    // ========================================

    let branchResult = 'success';
    let result = 'Activity executed successfully';

    try {
      // 示例：模拟业务处理
      // 在实际应用中，您可以在这里：
      // 1. 调用外部 API
      // 2. 更新数据库
      // 3. 发送通知
      // 4. 执行数据转换

      // 模拟处理
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 根据业务逻辑设置结果
      if (!contactKey) {
        branchResult = 'failure';
        result = 'Contact key is required';
      }

    } catch (error) {
      console.error('Business logic error:', error);
      branchResult = 'failure';
      result = error instanceof Error ? error.message : 'Unknown error occurred';
    }

    // 构建响应
    const response: ExecuteResponse = {
      branchResult,
      result,
    };

    console.log('Execute response:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Execute endpoint error:', error);

    return NextResponse.json(
      {
        branchResult: 'failure',
        result: 'Internal server error',
      },
      { status: 200 } // SFMC 期望 200 状态码，即使有错误
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
