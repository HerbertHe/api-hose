import { AlignType, APIHoseOptions, I18nType } from "../typing"
import {
    DeclareInlineTypeRegEx,
    DeclareMultiTypeHeadRegEx,
    DeclareMultiTypeContentRegEx,
    RequestDescRegEx,
    RequestHeadingRegEx,
    RequestMethodRegEx,
    RequestParamRegEx,
    RequestParamsEnd,
    SimpleHeadingRegEx,
} from "./regex"
import {
    TempCopyright,
    TempDescription,
    TempFilename,
    TempHeading,
    TempMethod,
    TempTableContent,
    TempTableEnd,
    TempTableHead,
    TempType,
} from "./template"

// 对应输出的内容
export const exporter = async (
    contentArray: Array<string>,
    opts: APIHoseOptions
) => {
    const defaultI18nzhCN: I18nType = {
        thead: ["参数", "类型", "说明"],
        optional: "可选的",
        method: "请求方法",
        extends: "继承",
    }
    const defaultI18nEn: I18nType = {
        thead: ["Params", "Type", "Description"],
        optional: "optional",
        method: "Method",
        extends: "Extends",
    }
    // 临时存放请求参数生成结果的数组, 检测到结束符的时候释放掉
    let _paramsResArrayTmp: Array<string> = []
    // 临时存放生成结果的数组
    let _resArrayTmp: Array<string> = []
    // 临时存放多行联合类型的数组
    let _resUnionTypeTmp: Array<string> = []
    // 多行联合类型的名称
    let _multiheadTmp: string = ""

    contentArray.map((item: string, index: number) => {
        if (index === 0) {
            _resArrayTmp.push(
                ...TempCopyright(),
                TempFilename(opts.filename as string)
            )
        }

        if (
            RequestHeadingRegEx(
                opts.prefix as string,
                opts.suffix as string
            ).test(item)
        ) {
            const ans = RequestHeadingRegEx(
                opts.prefix as string,
                opts.suffix as string
            ).exec(item) as RegExpExecArray
            const extendsType: Array<string> = !!ans[3]
                ? ans[4].split(",").map((item: string) => item.trim())
                : []
            const extendsDesc = (!!opts.i18n?.extends
                ? opts.i18n.extends
                : opts.lang === "en-US"
                ? defaultI18nEn.extends
                : defaultI18nzhCN.extends) as string

            _resArrayTmp.push(TempHeading(ans[2], extendsType, extendsDesc))
            return
        } else if (SimpleHeadingRegEx.test(item)) {
            const ans = SimpleHeadingRegEx.exec(item) as RegExpExecArray
            const extendsType: Array<string> = !!ans[3]
                ? ans[4].split(",").map((item: string) => item.trim())
                : []
            const extendsDesc = (!!opts.i18n?.extends
                ? opts.i18n.extends
                : opts.lang === "en-US"
                ? defaultI18nEn.extends
                : defaultI18nzhCN.extends) as string
            _resArrayTmp.push(TempHeading(ans[2], extendsType, extendsDesc))
            return
        }

        if (RequestMethodRegEx.test(item)) {
            const ans = RequestMethodRegEx.exec(item) as RegExpExecArray
            const method = (!!opts.i18n?.method
                ? opts.i18n.method
                : opts.lang === "en-US"
                ? defaultI18nEn.method
                : defaultI18nzhCN.method) as string
            _resArrayTmp.push(TempMethod(method, ans[1]))
            return
        } else if (RequestDescRegEx.test(item)) {
            const ans = RequestDescRegEx.exec(item) as RegExpExecArray
            _resArrayTmp.push(TempDescription(ans[1]))
            return
        }

        if (RequestParamRegEx.test(item)) {
            // 等于零要加表头
            if (_paramsResArrayTmp.length === 0) {
                const thead = (!!opts.i18n?.thead
                    ? opts.i18n.thead
                    : opts.lang === "en-US"
                    ? defaultI18nEn.thead
                    : defaultI18nzhCN.thead) as Array<string>
                _paramsResArrayTmp.push(
                    TempTableHead(thead, opts.align as AlignType)
                )
            }

            const ans = RequestParamRegEx.exec(item) as RegExpExecArray

            const optional = (!!opts.i18n?.thead
                ? opts.i18n.optional
                : opts.lang === "en-US"
                ? defaultI18nEn.optional
                : defaultI18nzhCN.optional) as string
            _paramsResArrayTmp.push(
                TempTableContent(
                    ans[1],
                    ans[3],
                    !!ans[5] ? ans[5] : "",
                    !!ans[2] ? optional : ""
                )
            )
            return
        }

        if (RequestParamsEnd.test(item)) {
            _resArrayTmp = [
                ..._resArrayTmp,
                ..._paramsResArrayTmp,
                TempTableEnd(),
            ]
            _paramsResArrayTmp = []
            return
        }

        if (DeclareInlineTypeRegEx.test(item)) {
            // 单行的情况
            let type: number = 0
            let types: Array<string> = []
            const ans = DeclareInlineTypeRegEx.exec(item) as RegExpExecArray
            if (ans[2].includes("&")) {
                types = ans[2].split("&").map((item: string) => item.trim())
                type = 1
            } else {
                types = ans[2].split("|").map((item: string) => item.trim())
                type = 0
            }
            _resArrayTmp.push(TempType(ans[1], types, type))
            return
        } else if (DeclareMultiTypeHeadRegEx.test(item)) {
            // 多行头
            const heading = DeclareMultiTypeHeadRegEx.exec(
                item
            ) as RegExpExecArray
            _multiheadTmp = heading[1]
            return
        } else if (DeclareMultiTypeContentRegEx.test(item)) {
            // 多行内容
            const type = DeclareMultiTypeContentRegEx.exec(
                item
            ) as RegExpExecArray
            _resUnionTypeTmp.push(type[1])
            // 判断下一项越界
            // 判断下一项是当前类型
            if (
                index === contentArray.length ||
                !DeclareMultiTypeContentRegEx.test(contentArray[index + 1])
            ) {
                _resArrayTmp.push(TempType(_multiheadTmp, _resUnionTypeTmp, 0))
                // 释放临时数组
                _resUnionTypeTmp = []
            }
            return
        }
    })

    return Promise.resolve(_resArrayTmp.join("\n"))
}
