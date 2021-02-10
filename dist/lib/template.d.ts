import { AlignType } from "../typing";
/**
 * 生成文件版权模板
 */
export declare const TempCopyright: () => string[];
/**
 * 文件名模板
 * @param filename 文件名
 */
export declare const TempFilename: (filename: string) => string;
/**
 * 标题名模板
 * @param heading 标题名
 */
export declare const TempHeading: (heading: string, extendsType: Array<string>, extendsDesc: string) => string;
/**
 * API描述模板
 * @param desc 描述信息
 */
export declare const TempDescription: (desc: string) => string;
/**
 * HTTP请求模板
 * @param prefix 不同语言的前缀
 * @param method 请求的方法
 */
export declare const TempMethod: (prefix: string, method: string) => string;
/**
 * 参数表格表头模板
 * @param {Array<string>} head 表头
 * @param {"left" | "right" | "center"} align 表格对齐方式
 */
export declare const TempTableHead: (head: Array<string>, align: AlignType) => string;
/**
 * 参数表格内容模板
 * @param name 参数名
 * @param type 参数类型
 * @param desc 参数描述
 * @param optional 可选描述
 */
export declare const TempTableContent: (name: string, type: string, desc: string, optional: string) => string;
/**
 * 参数表格结束模板
 */
export declare const TempTableEnd: () => string;
/**
 * 类型定义与联合类型模板
 * @param heading 定义的类型名称
 * @param types 联合类型数组
 */
export declare const TempType: (heading: string, types: Array<string>) => string;
