type Nullable<T = any> = T | null

export type AppState = {
    value: number,
    locker: Nullable<string>
}