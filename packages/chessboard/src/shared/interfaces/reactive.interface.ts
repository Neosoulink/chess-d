import { Observable } from "rxjs";

export type ObservablePayload<T> = T extends Observable<infer R> ? R : never;
