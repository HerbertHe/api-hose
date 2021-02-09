const { APIHose } = require("../dist/index")
const fs = require("fs")

console.log("生成api-hose测试demo文件...")
fs.readFile("./demo/demo.d.ts", "utf8", (err, data) => {
    if (err) throw err
    const filename = "api-hose测试"
    const res = new APIHose(data, { filename }).export()
    res.then((data) =>
        fs.writeFile(`./demo/${filename}.md`, data, (err) => {
            if (err) throw err
            console.log(`API文件生成成功: ${filename}.md`)
        })
    )
})
