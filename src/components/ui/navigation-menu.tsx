"use client";

import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown, BookOpen, ShieldCheck, Cpu, Sparkles, FileCode2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                         ESTILOS Y PRIMITIVAS CORE                           */
/* -------------------------------------------------------------------------- */

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=open]:text-accent-foreground data-[state=open]:bg-accent/50 data-[state=open]:hover:bg-accent data-[state=open]:focus:bg-accent"
);

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn("group flex flex-1 list-none items-center justify-center space-x-1", className)}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}{" "}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto",
      className
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        "origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]",
        className
      )}
      ref={ref}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className
    )}
    {...props}
  >
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

/* -------------------------------------------------------------------------- */
/*                      HELPER DE ENLACES PARA PANELES                        */
/* -------------------------------------------------------------------------- */

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string; icon?: React.ReactNode }
>(({ className, title, children, icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-2 text-sm font-medium leading-none">
            {icon}
            <span>{title}</span>
          </div>
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

/* -------------------------------------------------------------------------- */
/*                       COMPONENTE PRINCIPAL INTEGRADO                       */
/* -------------------------------------------------------------------------- */

export function LitleNavigationHeader({ className }: { className?: string }) {
  return (
    <NavigationMenu className={cn("mx-auto max-w-5xl", className)}>
      <NavigationMenuList>
        {/* INICIO / HOME */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Home</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-slate-900 to-slate-800 p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <ShieldCheck className="h-6 w-6 text-amber-400" />
                    <div className="mb-2 mt-4 text-lg font-medium text-white">
                      Ecosistema L-512
                    </div>
                    <p className="text-xs leading-relaxed text-slate-300">
                      Arquitectura en desarrollo para el resguardo del patrimonio intelectual y la trascendencia comunitaria.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/about" title="Soberanía Digital" icon={<Cpu className="h-4 w-4 text-primary" />}>
                Infraestructura no permisionada e inmutable para el conocimiento.
              </ListItem>
              <ListItem href="/manifesto" title="Manifiesto LITLE" icon={<BookOpen className="h-4 w-4 text-primary" />}>
                Principios del resguardo criptográfico y bibliotecario.
              </ListItem>
              <ListItem href="/network" title="Red P2P & Nodos" icon={<Sparkles className="h-4 w-4 text-primary" />}>
                Estado de la red distribuida y validación por reticulados.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* CATÁLOGO / LIBRARY */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Library</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <ListItem href="/library/catalog" title="Fondo Editorial" icon={<BookOpen className="h-4 w-4" />}>
                Explora manuscritos, reportes técnicos y libros compilados.
              </ListItem>
              <ListItem href="/library/pqc-verified" title="Obras Selladas L-512" icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />}>
                Documentos con firma post-cuántica y verificación de integridad AST.
              </ListItem>
              <ListItem href="/library/research" title="Investigación & Tesis" icon={<FileCode2 className="h-4 w-4" />}>
                Depósitos académicos con indexación de metadatos abiertos.
              </ListItem>
              <ListItem href="/library/categories" title="Índice Topológico" icon={<Sparkles className="h-4 w-4" />}>
                Navegación por grafos de conocimiento y temas emergentes.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* AUTORES / FOR AUTHORS */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>For Authors</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
              <ListItem href="/authors/ingestion" title="Motor de Ingesta IA" icon={<Sparkles className="h-4 w-4 text-indigo-500" />}>
                Sube tus archivos (PDF, DOCX, MD) y reconstruye tu borrador maestro.
              </ListItem>
              <ListItem href="/authors/compiler" title="Compilación Typst / LaTeX" icon={<FileCode2 className="h-4 w-4" />}>
                Maquetación automática de alta imprenta lista para distribución.
              </ListItem>
              <ListItem href="/authors/pqc-signature" title="Solicitud de Sellado L-512" icon={<ShieldCheck className="h-4 w-4 text-amber-500" />}>
                Genera tu huella inmutable de 512 Bytes antes de la publicación.
              </ListItem>
              <ListItem href="/authors/monetization" title="Distribución Soberana" icon={<Cpu className="h-4 w-4" />}>
                Venta directa en la tienda digital con regalías sin intermediarios.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* ESTÁNDAR / LITLE STANDARD */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>LITLE Standard</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
              <ListItem href="/standard/spec" title="Especificación 512B" icon={<FileCode2 className="h-4 w-4 text-amber-500" />}>
                Estructura binaria, desgloses de bloque A-D y algoritmos PQC.
              </ListItem>
              <ListItem href="/standard/verify" title="Verificador On-Chain/CLI" icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />}>
                Comprueba la validez de cualquier cadena `litle1...` en tiempo real.
              </ListItem>
              <ListItem href="/standard/docs" title="SDK & FFI Rust/TS" icon={<Cpu className="h-4 w-4" />}>
                Librerías para integrar el sellado LITLE en tus propias aplicaciones.
              </ListItem>
              <ListItem href="/standard/doi-interop" title="Interoperabilidad DOI" icon={<BookOpen className="h-4 w-4" />}>
                Coexistencia con Zenodo, Figshare y sistemas bibliométricos globales.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>

      <NavigationMenuIndicator />
    </NavigationMenu>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  EXPORTS                                   */
/* -------------------------------------------------------------------------- */

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  ListItem,
};
