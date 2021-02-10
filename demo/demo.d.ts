/**
 * 测试请求API
 * 两行描述
 * Method: GET
 */
export interface ReqXXXType {
    a?: string // 输出a变量类型为string
    b: number // 输出b变量类型为number
    c: boolean // 输出变量c类型为boolean
    d: ReqXXXType // 输出变量d类型为any
    e: Array<ReqXXXType> // 输出变量e类型为XXX类型的引用
    f: undefined // 输出f的变量类型为undefined
    g: null // 输出变量g类型为null
}

/**
 * 测试一般类型
 */
export interface SimpleType {
    hh?: string // 输出变量hh类型为string
}

/**
 * 测试Type类型定义
 */
type TestAType = ReqXXXType | string

/**
 * 测试多行Type
 */
type TestMultiLineType =
    | string
    | SimpleType
    | undefined
    | any
    | string
    | boolean
    | Array<SimpleType>
