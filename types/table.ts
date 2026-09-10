import { ReactNode } from "react";
export type TablePageProps = {
  title: string;
  subtitle?: string;
  addLabel?: string | null;
  headers: string[];
  rows: ReactNode;
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onAddClick?: () => void;
   setSearch: (value: string) => void;
  search?: string;
};