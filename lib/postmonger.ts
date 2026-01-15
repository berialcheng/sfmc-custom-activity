'use client';

import * as Postmonger from 'postmonger';
import type { CustomActivityState, JourneyInteraction, ActivityInstance } from './types';

// Postmonger Session 类型
interface PostmongerSession {
  on(event: string, callback: (data?: unknown) => void): void;
  trigger(event: string, data?: unknown): void;
}

/**
 * Journey Builder Postmonger 连接管理器
 * 用于与 Salesforce Marketing Cloud Journey Builder 进行通信
 */
export class JourneyBuilderConnection {
  private connection: PostmongerSession;
  private interaction: JourneyInteraction | null = null;
  private activity: ActivityInstance | null = null;
  private payload: CustomActivityState = {};

  constructor() {
    // Postmonger 导出 Session 构造函数
    const Session = (Postmonger as { Session: new () => PostmongerSession }).Session;
    this.connection = new Session();
  }

  /**
   * 初始化与 Journey Builder 的连接
   */
  initialize(callbacks: {
    onReady?: (data: { endpoints: Record<string, string> }) => void;
    onRequestPayload?: () => void;
    onGotoStep?: (step: { key: string; label: string }) => void;
    onClickedNext?: () => void;
    onClickedBack?: () => void;
  }) {
    // 监听初始化完成事件
    this.connection.on('initActivity', (data: unknown) => {
      const initData = data as JourneyInteraction & {
        activity?: ActivityInstance;
      };

      console.log('initActivity received:', initData);

      this.interaction = initData;
      this.activity = initData.activity || null;

      // 从 activity 中恢复已保存的配置
      if (this.activity?.arguments?.execute?.inArguments) {
        const inArgs = this.activity.arguments.execute.inArguments;
        inArgs.forEach((arg) => {
          Object.entries(arg).forEach(([key, value]) => {
            if (key !== 'contactKey' && key !== 'emailAddress') {
              (this.payload as Record<string, unknown>)[key] = value;
            }
          });
        });
      }
    });

    // Journey Builder 准备就绪
    this.connection.on('ready', (data: unknown) => {
      console.log('Journey Builder ready:', data);
      callbacks.onReady?.(data as { endpoints: Record<string, string> });

      // 告诉 Journey Builder 我们已准备好
      this.connection.trigger('ready');
      this.connection.trigger('requestInteraction');
    });

    // 请求当前 payload
    this.connection.on('requestedPayload', (data: unknown) => {
      console.log('requestedPayload:', data);
      callbacks.onRequestPayload?.();
    });

    // 步骤导航
    this.connection.on('gotoStep', (step: unknown) => {
      console.log('gotoStep:', step);
      callbacks.onGotoStep?.(step as { key: string; label: string });
    });

    // 用户点击"下一步"
    this.connection.on('clickedNext', () => {
      console.log('clickedNext');
      callbacks.onClickedNext?.();
    });

    // 用户点击"返回"
    this.connection.on('clickedBack', () => {
      console.log('clickedBack');
      callbacks.onClickedBack?.();
    });

    // 请求交互数据
    this.connection.on('requestedInteraction', (data: unknown) => {
      console.log('requestedInteraction:', data);
      this.interaction = data as JourneyInteraction;
    });
  }

  /**
   * 获取当前配置
   */
  getPayload(): CustomActivityState {
    return this.payload;
  }

  /**
   * 更新配置
   */
  updatePayload(updates: Partial<CustomActivityState>) {
    this.payload = { ...this.payload, ...updates };
  }

  /**
   * 保存 Activity 配置并关闭配置窗口
   */
  save() {
    if (!this.activity) {
      console.error('No activity to save');
      return;
    }

    // 构建 inArguments
    const inArguments = [
      { contactKey: '{{Contact.Key}}' },
      { emailAddress: '{{InteractionDefaults.Email}}' },
      ...Object.entries(this.payload).map(([key, value]) => ({ [key]: value })),
    ];

    // 更新 activity 配置
    this.activity.arguments = {
      execute: {
        inArguments,
        outArguments: [{ result: '' }],
      },
    };

    // 标记为已配置
    this.activity.metaData = {
      ...this.activity.metaData,
      isConfigured: true,
    };

    console.log('Saving activity:', this.activity);

    // 发送更新后的 activity 给 Journey Builder
    this.connection.trigger('updateActivity', this.activity);
  }

  /**
   * 设置是否启用"完成"按钮
   */
  setDoneEnabled(enabled: boolean) {
    this.connection.trigger('updateButton', {
      button: 'done',
      enabled,
    });
  }

  /**
   * 设置是否启用"下一步"按钮
   */
  setNextEnabled(enabled: boolean) {
    this.connection.trigger('updateButton', {
      button: 'next',
      enabled,
    });
  }

  /**
   * 设置是否启用"返回"按钮
   */
  setBackEnabled(enabled: boolean) {
    this.connection.trigger('updateButton', {
      button: 'back',
      enabled,
    });
  }

  /**
   * 跳转到指定步骤
   */
  gotoStep(stepKey: string) {
    this.connection.trigger('gotoStep', { key: stepKey });
  }

  /**
   * 触发自定义事件
   */
  trigger(event: string, data?: unknown) {
    this.connection.trigger(event, data);
  }

  /**
   * 监听自定义事件
   */
  on(event: string, callback: (data?: unknown) => void) {
    this.connection.on(event, callback);
  }

  /**
   * 获取当前 interaction
   */
  getInteraction(): JourneyInteraction | null {
    return this.interaction;
  }

  /**
   * 获取当前 activity
   */
  getActivity(): ActivityInstance | null {
    return this.activity;
  }
}

// 导出单例实例
let connectionInstance: JourneyBuilderConnection | null = null;

export function getConnection(): JourneyBuilderConnection {
  if (!connectionInstance) {
    connectionInstance = new JourneyBuilderConnection();
  }
  return connectionInstance;
}
