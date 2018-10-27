var Foo = /** @class */ (function () {
    function Foo() {
        this.str = "test";
    }
    Foo.prototype.bar = function () {
        var _this = this;
        (function () {
            console.log(_this.str);
        })();
    };
    return Foo;
}());
new Foo().bar();
