
export type ProductImage= {
   id?: number;
  product_id?: number;
  image_url: string;
  is_thumbnail?: boolean;
}

export type ImageUploaderProps= {
  images?: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}
