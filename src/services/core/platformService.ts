import { 
  PlatformState, 
  PlatformSettings, 
  PlatformModule, 
  ModuleAPI,
  ServiceResponse,
  PlatformEvent,
  EventHandler
} from '../../types/platform';
import TextGenerationModule from '../../modules/text-generation/TextGenerationModule';
import GrammarModule from '../../modules/grammar-check/GrammarCheckModule';
import RewritingModule from '../../modules/rewriting/RewritingModule';
import SummarizationModule from '../../modules/summarization/SummarizationModule';
import TranslationModule from '../../modules/translation/TranslationModule';
import { SEOModule } from '../../modules/seo/SEOModule';
import { TemplateModule } from '../../modules/templates/TemplateModule';
import { CollaborationModule } from '../../modules/collaboration/CollaborationModule';

class PlatformService {
  private state: PlatformState;
  private modules: Map<string, ModuleAPI> = new Map();
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();

  constructor() {
    this.state = this.getInitialState();
    this.initializeEventSystem();
    this.initializeModules();
  }

  private async initializeModules(): Promise<void> {
    try {
      // 注册所有核心模块
      await this.registerModule('textGeneration', new TextGenerationModule());
      await this.registerModule('grammar', new GrammarModule());
      await this.registerModule('rewriting', new RewritingModule());
      await this.registerModule('summarization', new SummarizationModule());
      await this.registerModule('translation', new TranslationModule());
      await this.registerModule('seo', new SEOModule());
      await this.registerModule('template', new TemplateModule());
      await this.registerModule('collaboration', new CollaborationModule());
      
      console.log('All modules initialized successfully');
    } catch (error) {
      console.error('Failed to initialize modules:', error);
    }
  }

  private getInitialState(): PlatformState {
    return {
      currentModule: 'dashboard',
      activeDocument: null,
      isProcessing: false,
      lastOperation: null,
      settings: this.getDefaultSettings(),
      modules: {}
    };
  }

  private getDefaultSettings(): PlatformSettings {
    return {
      modules: {
        textGeneration: true,
        grammarCheck: true,
        rewriting: true,
        translation: true,
        seo: true,
        templates: true
      },
      textGeneration: {
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 2000,
        style: 'formal',
        language: 'zh-CN'
      },
      grammarCheck: {
        enabled: true,
        realTime: true,
        language: 'zh-CN',
        strictness: 'medium'
      },
      translation: {
        defaultSourceLanguage: 'zh-CN',
        defaultTargetLanguage: 'en-US',
        provider: 'google'
      },
      seo: {
        enabled: true,
        targetKeywords: [],
        targetAudience: 'general',
        contentType: 'blog'
      },
      ui: {
        theme: 'system',
        language: 'zh-CN',
        compactMode: false,
        showPreview: true
      }
    };
  }

  private initializeEventSystem(): void {
    // 初始化事件系统
    this.on('module:loaded', this.handleModuleLoaded.bind(this));
    this.on('module:error', this.handleModuleError.bind(this));
    this.on('settings:changed', this.handleSettingsChanged.bind(this));
  }

  // 状态管理
  public getState(): PlatformState {
    return { ...this.state };
  }

  public updateState(updates: Partial<PlatformState>): void {
    this.state = { ...this.state, ...updates };
    this.emit('state:updated', { state: this.state });
  }

  // 模块管理
  public async registerModule(id: string, module: ModuleAPI): Promise<ServiceResponse> {
    try {
      await module.initialize();
      this.modules.set(id, module);
      
      const moduleInfo: PlatformModule = {
        id,
        name: id,
        version: '1.0.0',
        description: `${id} module`,
        enabled: true
      };

      this.updateState({
        modules: {
          ...this.state.modules,
          [id]: moduleInfo
        }
      });

      this.emit('module:loaded', { moduleId: id });

      return {
        success: true,
        data: moduleInfo,
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date(),
          processingTime: 0
        }
      };
    } catch (error) {
      this.emit('module:error', { moduleId: id, error });
      return {
        success: false,
        error: {
          code: 'MODULE_REGISTRATION_FAILED',
          message: `Failed to register module ${id}`,
          details: error
        },
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date(),
          processingTime: 0
        }
      };
    }
  }

  public async unregisterModule(id: string): Promise<ServiceResponse> {
    try {
      const module = this.modules.get(id);
      if (module) {
        await module.cleanup();
        this.modules.delete(id);
        
        const { [id]: removed, ...remainingModules } = this.state.modules;
        this.updateState({ modules: remainingModules });
        
        this.emit('module:unloaded', { moduleId: id });
      }

      return {
        success: true,
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date(),
          processingTime: 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MODULE_UNREGISTRATION_FAILED',
          message: `Failed to unregister module ${id}`,
          details: error
        },
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date(),
          processingTime: 0
        }
      };
    }
  }

  public getModule(id: string): ModuleAPI | undefined {
    return this.modules.get(id);
  }

  public getModules(): string[] {
    return Array.from(this.modules.keys());
  }

  // 模块请求处理
  public async processRequest(moduleId: string, request: any): Promise<ServiceResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      const module = this.modules.get(moduleId);
      if (!module) {
        throw new Error(`Module '${moduleId}' not found`);
      }

      this.updateState({ isProcessing: true, lastOperation: `${moduleId}:process` });
      
      const result = await module.process(request);
      const processingTime = Date.now() - startTime;

      this.updateState({ isProcessing: false });

      return {
        success: true,
        data: result,
        metadata: {
          requestId,
          timestamp: new Date(),
          processingTime
        }
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.updateState({ isProcessing: false });

      return {
        success: false,
        error: {
          code: 'MODULE_PROCESS_FAILED',
          message: `Failed to process request for module ${moduleId}`,
          details: error
        },
        metadata: {
          requestId,
          timestamp: new Date(),
          processingTime
        }
      };
    }
  }

  // 设置管理
  public getSettings(): PlatformSettings {
    return { ...this.state.settings };
  }

  public updateSettings(updates: Partial<PlatformSettings>): ServiceResponse {
    try {
      const newSettings = { ...this.state.settings, ...updates };
      this.updateState({ settings: newSettings });
      this.emit('settings:changed', { settings: newSettings });

      return {
        success: true,
        data: newSettings,
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date(),
          processingTime: 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SETTINGS_UPDATE_FAILED',
          message: 'Failed to update settings',
          details: error
        },
        metadata: {
          requestId: this.generateRequestId(),
          timestamp: new Date(),
          processingTime: 0
        }
      };
    }
  }

  // 事件系统
  public on<T = any>(eventType: string, handler: EventHandler<T>): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler as EventHandler);
  }

  public off<T = any>(eventType: string, handler: EventHandler<T>): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler as EventHandler);
    }
  }

  public emit(eventType: string, payload: any): void {
    const event: PlatformEvent = {
      type: eventType,
      payload,
      timestamp: new Date(),
      source: 'platform'
    };

    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      });
    }
  }

  // 处理器方法
  private handleModuleLoaded(event: PlatformEvent): void {
    console.log(`Module loaded: ${event.payload.moduleId}`);
  }

  private handleModuleError(event: PlatformEvent): void {
    console.error(`Module error: ${event.payload.moduleId}`, event.payload.error);
  }

  private handleSettingsChanged(event: PlatformEvent): void {
    console.log('Settings changed:', event.payload.settings);
    // 可以在这里触发设置保存到本地存储
    this.saveSettingsToStorage(event.payload.settings);
  }

  // 工具方法
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveSettingsToStorage(settings: PlatformSettings): void {
    try {
      localStorage.setItem('platform_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to storage:', error);
    }
  }

  public loadSettingsFromStorage(): PlatformSettings {
    try {
      const stored = localStorage.getItem('platform_settings');
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        return { ...this.getDefaultSettings(), ...parsedSettings };
      }
    } catch (error) {
      console.error('Failed to load settings from storage:', error);
    }
    return this.getDefaultSettings();
  }

  // 性能监控
  public async executeWithMetrics<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<ServiceResponse<T>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      this.updateState({ isProcessing: true, lastOperation: operationName });
      
      const result = await operation();
      const processingTime = Date.now() - startTime;

      this.updateState({ isProcessing: false });

      return {
        success: true,
        data: result,
        metadata: {
          requestId,
          timestamp: new Date(),
          processingTime
        }
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.updateState({ isProcessing: false });

      return {
        success: false,
        error: {
          code: 'OPERATION_FAILED',
          message: `Operation ${operationName} failed`,
          details: error
        },
        metadata: {
          requestId,
          timestamp: new Date(),
          processingTime
        }
      };
    }
  }
}

// 单例实例
export const platformService = new PlatformService();
export default platformService;