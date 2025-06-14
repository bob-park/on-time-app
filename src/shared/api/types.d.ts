interface Page<T> {
  content: T[];
  total: number;
  pageable: Pageable;
}

interface Pageable {
  pageNumber: number;
  pageSize: number;
}

type PageRequest = {
  page: number;
  size: number;
};
