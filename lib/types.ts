// Salesforce Marketing Cloud Custom Activity 类型定义

// Activity 配置接口
export interface ActivityConfig {
  workflowApiVersion: string;
  metaData: MetaData;
  type: 'REST';
  lang: Record<string, LangDefinition>;
  arguments: ActivityArguments;
  configurationArguments: ConfigurationArguments;
  userInterfaces: UserInterfaces;
  schema: SchemaDefinition;
  outcomes?: OutcomeDefinition[];
}

export interface MetaData {
  icon: string;
  category: string;
  isConfigured?: boolean;
}

export interface LangDefinition {
  name: string;
  description: string;
}

export interface ActivityArguments {
  execute: {
    inArguments: InArgument[];
    outArguments: OutArgument[];
    timeout?: number;
    retryCount?: number;
    retryDelay?: number;
    concurrentRequests?: number;
    url?: string;
  };
}

export interface InArgument {
  [key: string]: string | number | boolean | object;
}

export interface OutArgument {
  [key: string]: string;
}

export interface ConfigurationArguments {
  save?: EndpointConfig;
  publish?: EndpointConfig;
  validate?: EndpointConfig;
  stop?: EndpointConfig;
}

export interface EndpointConfig {
  url: string;
  verb?: 'POST' | 'GET' | 'PUT' | 'DELETE';
  body?: string;
  headers?: Record<string, string>;
  useJwt?: boolean;
}

export interface UserInterfaces {
  configurationSupports498ReadOnlyMode?: boolean;
  configModal?: {
    fullscreen?: boolean;
    height?: number;
    width?: number;
  };
  configInspector?: {
    size?: 'small' | 'medium' | 'large';
  };
}

export interface SchemaDefinition {
  arguments: {
    execute: {
      inArguments: SchemaProperty[];
      outArguments: SchemaProperty[];
    };
  };
}

export interface SchemaProperty {
  [key: string]: {
    dataType: 'Text' | 'Number' | 'Boolean' | 'Date' | 'EmailAddress' | 'Phone';
    isNullable?: boolean;
    direction?: 'in' | 'out' | 'inout';
    access?: 'visible' | 'hidden';
  };
}

export interface OutcomeDefinition {
  arguments: {
    branchResult: string;
  };
  metaData: {
    label: string;
  };
}

// Journey Builder 交互数据接口
export interface JourneyInteraction {
  id: string;
  key: string;
  name: string;
  version?: number;
  workflowApiVersion?: string;
  triggers?: unknown[];
  goals?: unknown[];
  activities?: ActivityInstance[];
  status?: string;
}

export interface ActivityInstance {
  id: string;
  key: string;
  name: string;
  type: string;
  arguments?: {
    execute?: {
      inArguments?: InArgument[];
      outArguments?: OutArgument[];
    };
  };
  configurationArguments?: Record<string, unknown>;
  metaData?: {
    isConfigured: boolean;
  };
}

// API 请求/响应接口
export interface ExecuteRequest {
  inArguments: InArgument[];
  outArguments?: OutArgument[];
  activityObjectID?: string;
  journeyId?: string;
  activityId?: string;
  definitionInstanceId?: string;
  activityInstanceId?: string;
  keyValue?: string;
  mode?: number;
}

export interface ExecuteResponse {
  branchResult?: string;
  [key: string]: unknown;
}

export interface SaveRequest {
  activityObjectID: string;
  interactionId: string;
  originalDefinitionId: string;
  activityId: string;
  version: number;
  isModified: boolean;
  configurationArguments: Record<string, unknown>;
}

export interface PublishRequest {
  activityObjectID: string;
  interactionId: string;
  originalDefinitionId: string;
  activityId: string;
  version: number;
}

export interface ValidateRequest {
  activityObjectID: string;
  interactionId: string;
  originalDefinitionId: string;
  activityId: string;
  version: number;
}

export interface StopRequest {
  activityObjectID: string;
  journeyId: string;
}

// Postmonger 事件接口
export interface PostmongerConnection {
  on: (event: string, callback: (data?: unknown) => void) => void;
  trigger: (event: string, data?: unknown) => void;
}

// 自定义 Activity 配置状态
export interface CustomActivityState {
  // 在此添加您的自定义配置字段
  apiEndpoint?: string;
  customField1?: string;
  customField2?: string;
  isEnabled?: boolean;
}
