// frontend/themeB/utils/formatCategoryName.ts

type CategoryLike =
  | string
  | string[]
  | { name: string; slug?: string };

export const formatCategoryName = (category: CategoryLike): string => {
  if (Array.isArray(category)) {
    return category.map(formatCategoryName).join(', ');
  }

  if (typeof category === 'object' && category !== null) {
    return category.name;
  }

  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
