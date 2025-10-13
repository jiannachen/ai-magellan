/**
 * 错误去重工具 - 确保相同错误只显示一次
 */
class ErrorDeduplicator {
  private seenErrors: Map<string, number> = new Map();
  private originalConsoleError: typeof console.error;

  constructor() {
    this.originalConsoleError = console.error;
    this.setupErrorDeduplication();
  }

  private generateErrorKey(message: any): string {
    const errorStr = String(message);
    
    // 处理翻译错误
    if (errorStr.includes('MISSING_MESSAGE') && errorStr.includes('Could not resolve')) {
      const match = errorStr.match(/Could not resolve `([^`]+)`/);
      if (match) {
        return `MISSING_MESSAGE:${match[1]}`;
      }
    }
    
    // 处理其他常见错误模式
    if (errorStr.includes('Failed to fetch') || errorStr.includes('Network error')) {
      return 'NETWORK_ERROR';
    }
    
    if (errorStr.includes('TypeError:') || errorStr.includes('ReferenceError:')) {
      // 提取错误类型和关键信息
      const match = errorStr.match(/(TypeError|ReferenceError):[^(]+/);
      if (match) {
        return match[0];
      }
    }
    
    // 对于过长的错误消息，截取前200个字符作为键
    return errorStr.length > 200 ? errorStr.substring(0, 200) : errorStr;
  }

  private setupErrorDeduplication() {
    console.error = (...args: any[]) => {
      if (args.length > 0) {
        const errorKey = this.generateErrorKey(args[0]);
        
        if (!this.seenErrors.has(errorKey)) {
          this.seenErrors.set(errorKey, 1);
          // 只在第一次出现时显示，并添加标识
          const deduplicatedArgs = [...args];
          if (typeof args[0] === 'string') {
            deduplicatedArgs[0] = `[FIRST OCCURRENCE] ${args[0]}`;
          }
          this.originalConsoleError.apply(console, deduplicatedArgs);
        } else {
          // 增加计数但不显示
          const currentCount = this.seenErrors.get(errorKey)! + 1;
          this.seenErrors.set(errorKey, currentCount);
          
          // 可选：每100次重复错误时提醒一次
          if (currentCount % 100 === 0) {
            this.originalConsoleError.call(console, `[SUPPRESSED ${currentCount} TIMES] ${errorKey}`);
          }
        }
      } else {
        this.originalConsoleError.apply(console, args);
      }
    };
  }

  // 获取错误统计
  getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.seenErrors.forEach((count, key) => {
      stats[key] = count;
    });
    return stats;
  }

  // 重置错误记录
  reset() {
    this.seenErrors.clear();
  }

  // 获取已见过的错误数量
  getUniqueErrorCount(): number {
    return this.seenErrors.size;
  }

  // 获取总的错误次数
  getTotalErrorCount(): number {
    let total = 0;
    this.seenErrors.forEach(count => {
      total += count;
    });
    return total;
  }
}

// 创建全局实例
const errorDeduplicator = new ErrorDeduplicator();

// 在开发环境下暴露到window对象以便调试
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__errorDeduplicator = errorDeduplicator;
}

export { errorDeduplicator };