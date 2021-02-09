// 在此生成正则表达式
export const BasicType = [
    "number",
    "boolean",
    "string",
    "undefined",
    "any",
    "null",
]

export const ArrayTypeRegEx = /Array<(\S+)>/

/**
 * 请求标题正则表达式
 * @param prefix 前缀
 * @param suffix 后缀
 * 默认为 ReqXXXType
 */
export const RequestHeadingRegEx = (prefix: string, suffix: string) => {
    return new RegExp(
        `((?! export).)*\\s*interface\\s*${prefix}([A-Za-z0-9\\$\\_]+)${suffix}\\s*{`
    )
}

/**
 * 普通标题正则表达式
 */
export const SimpleHeadingRegEx = new RegExp(
    `((?! export).)*\\s*interface\\s*([A-Za-z0-9\\$\\_]+)\\s*{`
)

/**
 * 请求描述正则表达式
 */
export const RequestDescRegEx = /\s*\*\s+([^\s]*)/

/**
 * 请求类型正则表达式
 */
export const RequestMethodRegEx = /\s*\*\s*Method:\s*([^\n]*)/

/**
 * 请求参数正则表达式
 * 如果没有描述的话只有三项
 */
export const RequestParamRegEx = /\s*([A-Za-z0-9\$\_]+)(\?)?:\s*(\S+)(\s*\/\/\s*(\s\S+))?/

/**
 * 处理参数结束正则表达式
 */
export const RequestParamsEnd = /\s*\}\s*/
