export interface MessageEventPayload<T = any> {
	token?: string;
	value?: T;
}
