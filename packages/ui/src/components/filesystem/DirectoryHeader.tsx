import { CopyIcon, HomeIcon, LayersIcon } from "@radix-ui/react-icons";
import { Button } from "@ui/lib/shadcn/button.js";
import { Input } from "@ui/lib/shadcn/input.js";
import { Label } from "@ui/lib/shadcn/label.js";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@ui/lib/shadcn/breadcrumb.js";
import { type DirectoryHeaderProps } from "./types.js";
import { cn } from "@ui/lib/utils.js";

export const DirectoryHeader = ({
  paths,
  manifestId,
  onNavigate,
}: DirectoryHeaderProps) => {
  if (!paths.length) return null;

  return (
    <div className="mb-4 flex justify-between">
      <Breadcrumb className="min-h-[24px]">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => onNavigate(0)}
              className="flex items-center gap-2 hover:text-foreground cursor-pointer"
            >
              <HomeIcon className="h-4 w-4" />
              {paths[0]}
            </BreadcrumbLink>
          </BreadcrumbItem>

          {paths.slice(1).map((path, index) => (
            <BreadcrumbItem key={`${index + 1}-${path}`}>
              <BreadcrumbSeparator />
              {index === paths.length - 2 ? (
                <BreadcrumbPage className="flex items-center gap-1">
                  <LayersIcon className="h-4 w-4" />
                  {path}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  onClick={() => onNavigate(index + 1)}
                  className={cn(
                    "flex items-center gap-1 hover:text-foreground cursor-pointer",
                    index === paths.length - 1 && "text-muted-foreground"
                  )}
                >
                  <LayersIcon className="h-4 w-4" />
                  {path}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {manifestId && (
        <div>
          <Label htmlFor="permalink">Permalink</Label>
          <div className="flex items-center">
            <Input
              id="permalink"
              className="font-mono rounded-r-none w-64"
              readOnly
              onClick={(e) => {
                e.currentTarget.select();
              }}
              defaultValue={`ar://${manifestId}/`}
            />
            <Button
              variant="outline"
              className="border-l-0 rounded-l-none"
              onClick={() =>
                navigator.clipboard.writeText(`ar://${manifestId}/`)
              }
            >
              <CopyIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

DirectoryHeader.displayName = "DirectoryHeader";
