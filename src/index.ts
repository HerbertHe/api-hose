import { exporter } from "./lib/export"
import { APIHoseOptions } from "./typing"

class APIHose {
    // 默认配置
    defaultOpts: APIHoseOptions = {
        filename: "APIHose",
        prefix: "Req",
        suffix: "Type",
        lang: "zh-CN",
        align: "center",
        i18n: {
            thead: ["参数", "类型", "说明"],
            optional: "可选",
            method: "请求方法",
        },
    }

    _opts: APIHoseOptions = {}
    _content: string = ""
    _contentArray: Array<string> = []

    constructor(content: string, opts?: APIHoseOptions) {
        this._opts = { ...this.defaultOpts, ...opts }
        this._content = content
    }

    // 获取配置项
    getOpt = (key: string) => {
        return this._opts[key]
    }

    // 分割源文本
    split = () => {
        this._contentArray = this._content.split("\n").filter((item) => !!item)
    }

    // 输出结果
    export = async () => {
        this.split()
        return await exporter(this._contentArray, this._opts)
    }
}

export { APIHose }
