class Foo
{
    str: string = "test";
    bar()
    {
        (() =>
        {
            console.log(this.str);
        })();
    }
}
new Foo().bar();