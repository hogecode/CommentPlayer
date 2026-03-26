'use client';

import { Link } from '@tanstack/react-router';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItemType[];
}

/**
 * ページのパンくずコンポーネント
 * 各ページで使用するパンくずナビゲーション
 */
export function PageBreadcrumb({ items }: PageBreadcrumbProps) {
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {items.map((item, index) => (
          <div key={`breadcrumb-${index}`} className="flex items-center gap-1.5">
            <BreadcrumbItem >
              {item.href ? (
                <BreadcrumbLink asChild className='text-teal-50'>
                  <Link to={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className='text-teal-50'>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
