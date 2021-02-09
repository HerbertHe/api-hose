# api-hose

[![version](https://img.shields.io/npm/v/api-hose.svg)](https://www.npmjs.com/package/api-hose)
[![download](https://img.shields.io/npm/dm/api-hose.svg)](https://www.npmjs.com/package/api-hose)
[![cnpmVersion](https://cnpmjs.org/badge/v/api-hose.svg)](https://cnpmjs.org/package/api-hose)
[![cnpmDownload](https://cnpmjs.org/badge/d/api-hose.svg)](https://cnpmjs.org/package/api-hose)

> 一个将interface转化为markdown文档的工具

**hose `[hoʊz]`** 在英文中是软管的意思, 希望这个库可以像一根管子一样🔗前后端开发的接口定义。没有依赖任何第三方库, 也没有把nodejs的东西打包进依赖, 只为了更轻、更小, 将此可以打包到cli工具中。目前并没有支持所有的类型定义语法, 不过目前已够用, 所有的特性都会在文档中列出。

## 特性

- [x] 支持同一文件内自定义类型锚点跳转
- [x] 支持基本的类型定义
- [x] 支持自定义类型
- [ ] 支持`type`定义类型(暂未支持, 还在考虑类型与非计算的问题和标准markdown转化)

## 体验一下

```bash
git clone https://github.com/HerbertHe/api-hose.git

yarn

yarn demo
```

> 示例见 [demo](./demo/index.js)

## 安装依赖

```bash
npm install api-hose

# or

yarn add api-hose
```

## 使用方法

```js
const { APIHose } = require("api-hose")
const res = new APIHose(`类型文件内容`, { filename: "文件名" }).export()
res.then(data => console.log(data))
```

> 更多请参考 [配置项](#配置项)

## 转化映射

```typescript
/**
 * 测试请求API     [API描述]
 * Method: GET    [请求方法]
 */
export interface ReqXXXType {                            // [接口名称, 请求类型接口会被去掉前后缀, 后面详述]
    a?: string // 输出a变量类型为string                     // [正常定义参数接口, 类型支持为白名单制]
    b: number // 输出b变量类型为number
    c: boolean // 输出变量c类型为boolean
    d: any // 输出变量d类型为any
    e: Array<ReqXXXType> // 输出变量e类型为XXX类型的引用
    f: undefined // 输出f的变量类型为undefined
    g: null // 输出变量g类型为null
}

/**
 * 测试一般类型
 */
export interface SimpleType {                            // [接口名称, 一般类型的接口]
    hh?: string // 输出变量hh类型为string
}
```

- 转化结果

```markdown
<!-- 下面为设置的的文件名 -->
# api-hose测试
<!-- API描述 -->
> 测试请求API
<!-- 请求方法 -->
请求方法: `GET`
<!-- 请求类型interface名 -->
## XXX
<!-- 参数列表 -->
| 参数 | 类型 | 说明 |
| :---: | :---: | :---: |
| a | string |  输出a变量类型为string (可选的) |
| b | number |  输出b变量类型为number |
| c | boolean |  输出变量c类型为boolean |
| d | any |  输出变量d类型为any |
| e | Array<[XXX](#XXX)> |  输出变量e类型为XXX类型的引用 |
| f | undefined |  输出f的变量类型为undefined |
| g | null |  输出变量g类型为null |
<!-- 一般类型描述 -->
> 测试一般类型
<!-- 一般类型interface名 -->
## SimpleType
<!-- 参数列表 -->
| 参数 | 类型 | 说明 |
| :---: | :---: | :---: |
| hh | string |  输出变量hh类型为string (可选的) |
<!-- 多个空行~标准文档 -->
```

## 支持的语法情况

> 本库基于自己写正则表达式实现的, 所以是增量更新支持的语法

现已支持下面的类型和自定义类型

| 类型      |
| --------- |
| number    |
| boolean   |
| string    |
| undefined |
| any       |
| null      |
| Array\<T> |

目前仅支持interface作为类型定义, 会在后面的更新中支持type进行类型运算

## 配置项

```typescript
/**
 * 国际化接口 (优先级高于默认的lang设置)
 * @param {Array<string>} thead 参数表头信息(三项, 默认为 ["参数", "类型", "说明"])
 * @param {string} optional 自定义可选参数文字(当类型为?:时, 默认将会在说明后面添加 "可选的")
 * @param {string} method 请求方法(请求方法的提示文字, 默认为 "请求方法")
 */
export interface I18nType {
    thead?: Array<string>
    optional?: string
    method?: string
}

/**
 * AlignType 表格对齐方式
 */
export type AlignType = "left" | "right" | "center"

/**
 * APIHose的设置
 * @param {string} filename 文件名称
 * @param {string} prefix 请求接口前缀
 * @param {string} suffix 请求接口后缀
 * @param {"zh-CN" | "en-US"} 语言类型(优先级低于国际化配置项)
 * @param {"left" | "right" | "center"} align 表格对齐方式
 */
export interface APIHoseOptions {
    filename?: string
    prefix?: string
    suffix?: string
    lang?: "zh-CN" | "en-US"
    align?: AlignType
    i18n?: I18nType
}
```

- 默认配置项

```typescript
const defaultOpts: APIHoseOptions = {
    filename: "APIHose",
    prefix: "Req",
    suffix: "Type",
    lang: "zh-CN",
    align: "center"
}

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
```

> 需要注意的是`prefix`和`suffix`都是为了区别请求接口类型和普通接口类型的, 如果类型为请求接口将去掉前后缀, **请注意去掉之后可能存在的重名情况!**
> TypeScript的标识符定义规范, 根据实际的需求即可

## 为什么要写这个库

在实际前后端分离的开发过程中, 手写Markdown接口文档是比较麻烦的, 那么如何更好地偷懒呢? 于是这个项目就产生了。TypeScript是JavaScript的超集, 它可以支持更新的JavaScript语法, 让我们的开发更加的轻快。最重要的也是, 最香的要属它非常强悍的类型系统了。

TypeScript有着严格的类型语法规范, prettier可以帮我们很好的格式化我们的TypeScript代码, 将类型定义文件分离代码共用。除此之外, nodejs带给我们了JavaScript脱离浏览器的开发的体验, 让我们可以更随心模块化封装可以通用的库。那么, 为什么不可以将Typescript的类型定义用于自动生成markdown的文档呢？得益于在markdown上的积累, 于是, 正如你所见到的。
