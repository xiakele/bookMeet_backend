function test() {
    try {
        console.log("test")
        return
        console.log("test2")
    } catch {
        console.log("test3")
    } finally {
        console.log("test4")
    }
    console.log("test5")
}
test()