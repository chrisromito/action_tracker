const transform_fields = require("./transform_fields")
// @ponicode
describe("transform_fields.transformDecimalFields", () => {
    test("0", () => {
        let callFunction = () => {
            transform_fields.transformDecimalFields([-1, 0.5, 1, 2, 3, 4, 5])
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            transform_fields.transformDecimalFields(["a", "b", "043", "holasenior"])
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            transform_fields.transformDecimalFields([10, -45.9, 103.5, 0.955674])
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            transform_fields.transformDecimalFields(["foo bar", -0.353, "**text**", 4653])
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            transform_fields.transformDecimalFields(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})
