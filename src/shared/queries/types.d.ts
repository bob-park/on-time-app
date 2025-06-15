interface QueryHandler<T> {
  onSuccess?: (data: T) => void;
  onError?: (error?: Error) => void;
}
