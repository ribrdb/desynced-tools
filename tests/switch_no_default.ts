export function foo(v: Value) {
    switch(v.type) {
        case "No Match":
            notify("No Match");
            break;
    }
}