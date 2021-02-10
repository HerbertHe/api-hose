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
 * 类型定义正则表达式单行
 */
export declare const DeclareInlineTypeRegEx: RegExp;
/**
 * 类型定义正则表达式多行
 */
export declare const DeclareMultiTypeHeadRegEx: RegExp;
/**
 * 通过测试下一项来考虑是否结束
 */
export declare const DeclareMultiTypeContentRegEx: RegExp;
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
