import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface DataPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems: number;
  showInfo?: boolean;
  infoClassName?: string;
  pageSizeOptions?: number[];
  onItemsPerPageChange?: (size: number) => void;
  containerRef?: React.Ref<HTMLDivElement>;
}

export function DataPagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 10,
  totalItems,
  showInfo = true,
  infoClassName = "text-sm text-gray-700",
  pageSizeOptions,
  onItemsPerPageChange,
  containerRef,
}: DataPaginationProps) {
  // Calcular range de itens sendo exibidos
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Gerar array de páginas para exibir
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Se há poucas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas com elipses
      if (currentPage <= 3) {
        // Início: 1, 2, 3, 4, ..., último
        for (let i = 1; i <= Math.min(4, totalPages); i++) {
          pages.push(i);
        }
        if (totalPages > 4) pages.push('ellipsis', totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Final: 1, ..., antepenúltimo, penúltimo, último
        pages.push(1);
        if (totalPages > 4) pages.push('ellipsis');
        for (let i = Math.max(totalPages - 3, 2); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Meio: 1, ..., atual-1, atual, atual+1, ..., último
        pages.push(1, 'ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis', totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div ref={containerRef} className={`flex flex-row items-center gap-3 px-4 py-3 border-t border-gray-200 bg-white ${showInfo ? 'justify-between' : 'justify-center'}`}>
      {showInfo && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className={infoClassName}>
            Mostrando {startItem} a {endItem} de {totalItems} resultados
          </div>
          {onItemsPerPageChange && pageSizeOptions && pageSizeOptions.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>Por página:</span>
              <Select
                value={String(itemsPerPage)}
                onValueChange={(val) => onItemsPerPageChange(Number(val))}
              >
                <SelectTrigger className="h-9 w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((opt) => (
                    <SelectItem key={opt} value={String(opt)}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
      
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => onPageChange(currentPage - 1)}
              className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100'}
            />
          </PaginationItem>
          
          {getVisiblePages().map((page, index) => (
            <PaginationItem key={index}>
              {page === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => onPageChange(page as number)}
                  isActive={page === currentPage}
                  className={`cursor-pointer hover:bg-gray-100 ${
                    page === currentPage ? 'bg-[#242f65] text-white hover:bg-[#1a2148]' : ''
                  }`}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => onPageChange(currentPage + 1)}
              className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

