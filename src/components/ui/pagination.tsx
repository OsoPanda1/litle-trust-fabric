"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

/* -------------------------------------------------------------------------- */
/*                         COMPONENTES BASE DE PAGINACIÓN                     */
/* -------------------------------------------------------------------------- */

const Pagination = ({
  className,
  ...props
}: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn(
      "mx-auto flex w-full justify-center",
      "text-[rgba(242,240,232,0.9)]",
      className,
    )}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn(
      "flex flex-row items-center gap-1.5",
      className,
    )}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("flex items-center", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

/* -------------------------------------------------------------------------- */
/*                             LINKS DE PAGINACIÓN                            */
/* -------------------------------------------------------------------------- */

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      // Estética LITLE – folio editorial
      "h-9 w-9 rounded-full border border-transparent",
      "text-xs font-medium tracking-[0.12em] uppercase",
      "text-[rgba(242,240,232,0.85)]",
      "bg-[rgba(10,12,18,0.95)]",
      "transition-colors duration-150",
      "hover:bg-[rgba(215,181,109,0.12)] hover:text-[rgba(255,255,255,0.98)]",
      isActive &&
        "border-[rgba(215,181,109,0.7)] bg-[rgba(12,14,20,0.98)] text-[rgba(255,255,255,1)] font-semibold",
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

/* -------------------------------------------------------------------------- */
/*                    CONTROLES PREVIOUS / NEXT (EDITORIAL)                   */
/* -------------------------------------------------------------------------- */

const PaginationPrevious = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Ir a la página anterior"
    size="default"
    className={cn(
      "gap-1.5 px-3.5 py-2 cursor-pointer",
      "rounded-full bg-[rgba(9,11,16,0.96)]",
      "hover:bg-[rgba(215,181,109,0.14)]",
      className,
    )}
    {...props}
  >
    <ChevronLeft className="h-4 w-4 text-[rgba(215,181,109,0.85)]" />
    <span className="text-[0.7rem] tracking-[0.2em] uppercase">
      {children ?? "Anterior"}
    </span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Ir a la página siguiente"
    size="default"
    className={cn(
      "gap-1.5 px-3.5 py-2 cursor-pointer",
      "rounded-full bg-[rgba(9,11,16,0.96)]",
      "hover:bg-[rgba(215,181,109,0.14)]",
      className,
    )}
    {...props}
  >
    <span className="text-[0.7rem] tracking-[0.2em] uppercase">
      {children ?? "Siguiente"}
    </span>
    <ChevronRight className="h-4 w-4 text-[rgba(215,181,109,0.85)]" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

/* -------------------------------------------------------------------------- */
/*                              ELIPSIS (GAPS)                                */
/* -------------------------------------------------------------------------- */

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn(
      "flex h-9 w-9 items-center justify-center",
      "text-[rgba(180,176,164,0.9)]",
      className,
    )}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">Más páginas</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

/* -------------------------------------------------------------------------- */
/*                 COMPONENTE INTEGRADO (CATÁLOGO L-512)                      */
/* -------------------------------------------------------------------------- */

interface LitleCatalogPaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function LitleCatalogPagination({
  currentPage = 1,
  totalPages = 12,
  onPageChange,
  className,
}: LitleCatalogPaginationProps) {
  const handlePageClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    page: number,
  ) => {
    e.preventDefault();
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange?.(page);
    }
  };

  return (
    <Pagination className={cn("py-4", className)}>
      <PaginationContent>
        {/* Botón Anterior */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => handlePageClick(e, currentPage - 1)}
            className={currentPage === 1 ? "pointer-events-none opacity-35" : ""}
          />
        </PaginationItem>

        {/* Primera página */}
        <PaginationItem>
          <PaginationLink
            href="#"
            isActive={currentPage === 1}
            onClick={(e) => handlePageClick(e, 1)}
          >
            1
          </PaginationLink>
        </PaginationItem>

        {/* Elipsis inicial */}
        {currentPage > 3 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Página intermedia activa (ventana central) */}
        {currentPage > 2 && currentPage < totalPages && (
          <PaginationItem>
            <PaginationLink
              href="#"
              isActive
              onClick={(e) => handlePageClick(e, currentPage)}
            >
              {currentPage}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Elipsis final */}
        {currentPage < totalPages - 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Última página */}
        {totalPages > 1 && (
          <PaginationItem>
            <PaginationLink
              href="#"
              isActive={currentPage === totalPages}
              onClick={(e) => handlePageClick(e, totalPages)}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Botón Siguiente */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => handlePageClick(e, currentPage + 1)}
            className={
              currentPage === totalPages
                ? "pointer-events-none opacity-35"
                : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  EXPORTS                                   */
/* -------------------------------------------------------------------------- */

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
