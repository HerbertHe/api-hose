/**
 * 国际化接口
 * @param {Array<string>} thead 表头信息
 * @param {string} optional 自定义
 * @param {string} method 请求方法
 * @param {string} extends 继承描述
 */
export interface I18nType {
    thead?: Array<string>;
    optional?: string;
    method?: string;
    extends?: string;
}
/**
 * AlignType
 */
export declare type AlignType = "left" | "right" | "center";
/**
 * APIHose的设置
 * @param {string} filename 文件名称
 * @param {string} prefix 正则前缀
 * @param {string} suffix 正则后缀
 * @param {"zh-CN" | "en-US"} 输出语言类型
 * @param {"left" | "right" | "center"} align 表格对齐方式
 */
export interface APIHoseOptions {
    [index: string]: any;
    filename?: string;
    prefix?: string;
    suffix?: string;
    lang?: "zh-CN" | "en-US";
    align?: AlignType;
    i18n?: I18nType;
}
