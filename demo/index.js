const { APIHose } = require("../dist/index")
const fs = require("fs")

fs.readFile("./demo/demo.d.ts", "utf8", (err, data) => {
    if (err) throw err
    new APIHose(data, {
        filename: "测试类型",
    })
        .export()
        .then((res) => console.log(res))
})
