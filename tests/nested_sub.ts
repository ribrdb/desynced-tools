export function foo() {
    sub1();
}

function sub1() {
    sub2();
}

function sub2() {
    notify("hello world");
}