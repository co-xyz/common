import { useMemo } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@ui/lib/shadcn/breadcrumb.js";
import { cn } from "@ui/lib/utils.js";
import { LayersIcon, HomeIcon } from "@radix-ui/react-icons";

interface FilePathBreadcrumbProps {
  paths: string[];
  onNavigate: (index: number) => void;
  className?: string;
}

const FilePathBreadcrumb = ({
  paths,
  onNavigate,
  className,
}: FilePathBreadcrumbProps) => {
  const breadcrumbItems = useMemo(
    () =>
      paths.map((path, index) => ({
        name: path,
        isLast: index === paths.length - 1,
        index,
      })),
    [paths]
  );

  if (!paths.length) return null;

  return (
    <Breadcrumb className={cn("min-h-[24px]", className)}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={() => onNavigate(0)}
            className="flex items-center gap-2 hover:text-foreground cursor-pointer"
          >
            <HomeIcon className="h-4 w-4" />
            {breadcrumbItems[0]?.name ?? ""}
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbItems.slice(1, breadcrumbItems.length).map((item) => (
          <>
            <BreadcrumbSeparator />
            {item.isLast ? (
              <BreadcrumbItem key={`${item.index}-${item.name}`}>
                <BreadcrumbPage className="flex items-center gap-1">
                  <LayersIcon className="h-4 w-4" />
                  {item.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <>
                <BreadcrumbItem key={`${item.index}-${item.name}`}>
                  <BreadcrumbLink
                    onClick={() => onNavigate(item.index + 1)}
                    className="flex items-center gap-1 hover:text-foreground cursor-pointer"
                  >
                    <LayersIcon className="h-4 w-4" />
                    {item.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
          </>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

FilePathBreadcrumb.displayName = "FilePathBreadcrumb";

export { FilePathBreadcrumb };
export type { FilePathBreadcrumbProps };
