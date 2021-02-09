export declare const BasicType: string[];
export declare const ArrayTypeRegEx: RegExp;
/**
 * 请求标题正则表达式
 * @param prefix 前缀
 * @param suffix 后缀
 * 默认为 ReqXXXType
 */
export declare const RequestHeadingRegEx: (prefix: string, suffix: string) => RegExp;
/**
 * 普通标题正则表达式
 */
export declare const SimpleHeadingRegEx: RegExp;
/**
 * 请求描述正则表达式
 */
export declare const RequestDescRegEx: RegExp;
/**
 * 请求类型正则表达式
 */
export declare const RequestMethodRegEx: RegExp;
/**
 * 请求参数正则表达式
 * 如果没有描述的话只有三项
 */
export declare const RequestParamRegEx: RegExp;
/**
 * 处理参数结束正则表达式
 */
export declare const RequestParamsEnd: RegExp;
