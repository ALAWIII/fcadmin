"use client";
import { useEffect, useState } from "react";
import { GrRefresh } from "react-icons/gr";
import { FaFolder, FaFile, FaArrowLeft } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { cn } from "../../lib/utils";
import { GlassCard } from "./glassContainer";
import { fetchFolderChildren } from "~/lib/api";
import type { FSItem } from "~/lib/models";
// ─── API Types ────────────────────────────────────────────────────────────────
interface FileBrowserProps {
  rootId: string;
  onBack: () => void;
}

function formatSize(bytes?: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type DialogMode = "details" | "delete" | null;
type FoldersChildren = Map<string, FSItem[]>;
type PathSegment = { id: string; name: string };

export function FileBrowser({ rootId, onBack }: FileBrowserProps) {
  const [children, setChildren] = useState<FoldersChildren>(new Map());
  const [pathStack, setPathStack] = useState<PathSegment[]>([
    { id: rootId, name: "" },
  ]);

  // Fetch root folder on mount
  useEffect(() => {
    fetchFolderChildren(rootId).then((fitems) => {
      setChildren((p) => new Map(p).set(rootId, fitems));
    });
  }, [rootId]);

  // Open folder → push to stack + fetch children if not cached
  const openFolder = (item: FSItem) => {
    if (item.type !== "folder") return;

    setPathStack((prev) => [...prev, { id: item.id, name: item.name }]);

    if (!children.has(item.id)) {
      fetchFolderChildren(item.id).then((fitems) => {
        setChildren((p) => new Map(p).set(item.id, fitems));
      });
    }
  };

  // Go back → pop from stack, if at root → call onBack
  const goUp = () => {
    if (pathStack.length === 1) {
      onBack();
      return;
    }
    setPathStack((prev) => prev.slice(0, -1));
  };

  // Breadcrumb click → slice stack to that index
  const navigateTo = (index: number) => {
    setPathStack((prev) => prev.slice(0, index + 1));
  };

  // Refresh current folder
  const handleRefresh = async () => {
    const currentId = pathStack.at(-1)!.id;
    const fitems = await fetchFolderChildren(currentId);
    setChildren((p) => new Map(p).set(currentId, fitems));
  };

  // Delete item from children map
  const handleDelete = (item: FSItem) => {
    setChildren((p) => {
      const newMap = new Map(p);
      const parentId =
        item.type === "file" ? item.parentId : pathStack.at(-1)!.id;
      const siblings = newMap.get(parentId) ?? [];
      newMap.set(
        parentId,
        siblings.filter((i) => i.id !== item.id),
      );
      return newMap;
    });
  };

  const currentItems = children.get(pathStack.at(-1)!.id) ?? [];

  return (
    <GlassCard className="h-full flex flex-col gap-2 overflow-hidden p-4">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={goUp}
          className="h-9 w-9 flex items-center justify-center rounded-xl
            hover:bg-white/30 transition-all duration-200"
        >
          <FaArrowLeft className="text-blue-800" />
        </button>

        {/* Breadcrumb */}
        <div
          className="flex-1 flex items-center gap-1 bg-white/20 rounded-xl
          px-3 py-1.5 border border-white/30 overflow-x-auto"
        >
          {pathStack.map((seg, i) => (
            <span key={seg.id} className="flex items-center gap-1">
              {i > 0 && <span className="text-blue-400">/</span>}
              <button
                onClick={() => navigateTo(i)}
                className={cn(
                  "text-sm font-inter font-medium transition-colors",
                  i === pathStack.length - 1
                    ? "text-blue-900 font-bold"
                    : "text-blue-500 hover:text-blue-800",
                )}
              >
                {seg.name}
              </button>
            </span>
          ))}
        </div>

        <button
          onClick={handleRefresh}
          className="h-9 w-9 flex items-center justify-center rounded-xl
            hover:bg-white/30 transition-all duration-200"
        >
          <GrRefresh className="text-blue-800" />
        </button>
      </div>

      {/* ── File list ── */}
      <div className="flex-1 overflow-auto flex flex-col gap-1 min-h-0">
        {currentItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-blue-600 italic">
            This folder is empty
          </div>
        ) : (
          currentItems.map((item) => (
            <FSRow
              key={item.id}
              item={item}
              onOpen={openFolder}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </GlassCard>
  );
}
function FSRow({
  item,
  onOpen,
  onDelete,
}: {
  item: FSItem;
  onOpen: (item: FSItem) => void;
  onDelete: (item: FSItem) => void;
}) {
  const [dialog, setDialog] = useState<DialogMode>(null);

  return (
    <>
      <div
        className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-center
        px-3 py-2 rounded-xl bg-white/10 hover:bg-white/25
        border border-white/20 transition-all duration-150"
      >
        <button
          className="flex items-center gap-2 text-left"
          onClick={() => onOpen(item)}
        >
          {item.type === "folder" ? (
            <FaFolder className="text-amber-400 shrink-0" />
          ) : (
            <FaFile className="text-blue-400 shrink-0" />
          )}
          <span className="font-inter text-sm font-medium text-blue-900 truncate">
            {item.name}
          </span>
        </button>

        <span className="text-sm text-blue-700">
          {item.type === "file" ? formatSize(item.size) : "—"}
        </span>
        <span className="text-sm text-blue-700">
          {item.type === "file" ? item.mimeType : "Folder"}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-7 px-2">
              ⋯
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setDialog("details")}>
              Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500"
              onSelect={() => setDialog("delete")}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Details */}
      <Dialog open={dialog === "details"} onOpenChange={() => setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Details</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Name</span>
            <span>{item.name}</span>
            <span className="text-muted-foreground">Type</span>
            <span className="capitalize">{item.type}</span>
            {item.type === "file" && (
              <>
                <span className="text-muted-foreground">Size</span>
                <span>{formatSize(item.size)}</span>
                <span className="text-muted-foreground">MIME</span>
                <span>{item.mimeType}</span>
                <span className="text-muted-foreground">ETag</span>
                <span className="break-all text-xs">{item.etag}</span>
              </>
            )}
            <span className="text-muted-foreground">Status</span>
            <span>{item.status}</span>
            <span className="text-muted-foreground">Visibility</span>
            <span>{item.visibility}</span>
            <span className="text-muted-foreground">ID</span>
            <span className="break-all text-xs">{item.id}</span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog
        open={dialog === "delete"}
        onOpenChange={(o) => !o && setDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{item.name}"?</AlertDialogTitle>
            <AlertDialogDescription className="text-red-500">
              ⚠️ This will permanently delete this {item.type}. Cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                onDelete(item);
                setDialog(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
