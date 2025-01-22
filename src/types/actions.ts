// src/types/actions.ts
import type { AxiosResponse } from "axios";

export interface ActionResponse<T> {
	data: T;
	status: number;
	message?: string;
}

export type ApiResponse<T> = Promise<AxiosResponse<ActionResponse<T>>>;
