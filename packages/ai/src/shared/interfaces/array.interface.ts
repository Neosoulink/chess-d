export type FixedArray<T, N extends number> = [T, ...T[]] & { length: N };
