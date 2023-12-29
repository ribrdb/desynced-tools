export function rng(max:Value, min:Value, state:Value) {
    unlock();
    let r = max.num - min.num + 1;
    if (state.num <= 0) {
        state = factionItemAmount("metalore");
    }
    state = modulo(17364*state.num+1, 65521);
    return r*state.num/65521+min.num;
}