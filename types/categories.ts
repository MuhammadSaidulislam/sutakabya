import { Dispatch, SetStateAction } from "react";
export interface AddCategoryProps {
  open: boolean;
  loading?: boolean;
  editing?: boolean;
  name: string;
  subCategory: string;
  subCategories: SubCategory[];
  setSubCategories: Dispatch<SetStateAction<SubCategory[]>>;
  description: string;
  onNameChange: (value: string) => void;
  onSubChange: (value: string) => void;
  addSubCategory: () => void;
  onDescriptionChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}
export type Category = {
  id: string;
  name: string;
  slug?: string;
  description: string;
  subCategories: SubCategory[];
  image: string;
  productCount?: number;
  created_at?: string;
};

export type SubCategory = {
  id?: number;
  category_id?: number;
  name: string;
  slug?: string;
  status?: "ACTIVE" | "INACTIVE";
  created_at?: string;
  updated_at?: string;
};