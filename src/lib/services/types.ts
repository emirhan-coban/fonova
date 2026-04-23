export type ServiceResult<T = void> = {
  ok: boolean;
  message: string;
  data?: T;
};
