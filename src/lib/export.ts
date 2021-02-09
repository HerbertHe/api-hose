import { AlignType, APIHoseOptions, I18nType } from "../typing"
import {
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
    }
    const defaultI18nEn: I18nType = {
        thead: ["Params", "Type", "Description"],
        optional: "optional",
        method: "Method",
    }
    // 临时存放请求参数生成结果的数组, 检测到结束符的时候释放掉
    let _paramsResArrayTmp: Array<string> = []
    // 临时存放生成结果的数组
    let _resArrayTmp: Array<string> = []

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
            _resArrayTmp.push(TempHeading(ans[2]))
            return
        } else if (SimpleHeadingRegEx.test(item)) {
            const ans = SimpleHeadingRegEx.exec(item) as RegExpExecArray
            _resArrayTmp.push(TempHeading(ans[2]))
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
                    !!ans[2] ? optional : "",
                    opts.prefix as string,
                    opts.suffix as string
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
    })

    return Promise.resolve(_resArrayTmp.join("\n"))
}
