export interface MessageData<T_Value = any, T_Token extends string = string> {
	token?: T_Token;
	value?: T_Value;
}
