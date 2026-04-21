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
// ─── API Types ────────────────────────────────────────────────────────────────
interface FileBrowserProps {
  userId: string; // uuid to match ownerId
  onBack: () => void;
}
function formatSize(bytes?: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
type DialogMode = "details" | "delete" | null;
export type FileItem = {
  id: string; // uuid
  ownerId: string;
  parentId: string; // uuid of parent folder
  name: string; // "report.pdf"
  size: number;
  etag: string;
  mimeType: string;
  status: string;
  visibility: string;
  type: "file";
};

export type FolderItem = {
  id: string; // uuid
  ownerId: string;
  name: string;
  status: string;
  visibility: string;
  copyingChildrenCount: number;
  type: "folder";
};

export type FSItem = FileItem | FolderItem;

// ─── In-memory HashMap: id → FSItem ──────────────────────────────────────────
// Fast O(1) lookup by id
export type FSMap = Map<string, FSItem>;

// ─── Children index: parentId → FSItem[] ─────────────────────────────────────
// Fast O(1) lookup of folder contents
export type FSChildrenMap = Map<string, FSItem[]>;

// ─── Path segment: name + id ──────────────────────────────────────────────────
// Breadcrumb stores both so we navigate by id, display by name
type PathSegment = { id: string; name: string };

function buildFSMaps(items: FSItem[]): {
  fsMap: FSMap;
  childrenMap: FSChildrenMap;
} {
  const fsMap: FSMap = new Map();
  const childrenMap: FSChildrenMap = new Map();

  for (const item of items) {
    // Index every item by its id
    fsMap.set(item.id, item);

    // Index children by parentId (files only — folders have no parentId in your model)
    if (item.type === "file") {
      const siblings = childrenMap.get(item.parentId) ?? [];
      siblings.push(item);
      childrenMap.set(item.parentId, siblings);
    }
  }

  // Index root folders (no parentId) under a special "root" key
  for (const item of items) {
    if (item.type === "folder") {
      const rootFolders = childrenMap.get("root") ?? [];
      rootFolders.push(item);
      childrenMap.set("root", rootFolders);
    }
  }

  return { fsMap, childrenMap };
}

const ROOT: PathSegment = { id: "root", name: "/" };

export function FileBrowser({ userId, onBack }: FileBrowserProps) {
  const [fsMap, setFsMap] = useState<FSMap>(new Map());
  const [childrenMap, setChildrenMap] = useState<FSChildrenMap>(new Map());

  // Path stack: array of {id, name} segments
  // e.g. [{id:"root", name:"/"}, {id:"uuid-1", name:"Documents"}, ...]
  const [pathStack, setPathStack] = useState<PathSegment[]>([ROOT]);

  // Current folder = last segment in stack
  const currentFolder = pathStack[pathStack.length - 1];

  // Items in current folder
  const visibleItems = childrenMap.get(currentFolder.id) ?? [];

  // Fetch files from API on mount
  useEffect(() => {
    fetch(`/api/files/${userId}`)
      .then((r) => r.json())
      .then((data: FSItem[]) => {
        const { fsMap, childrenMap } = buildFSMaps(data);
        setFsMap(fsMap);
        setChildrenMap(childrenMap);
      });
  }, [userId]);

  // Open folder → push to stack
  const openFolder = (item: FSItem) => {
    if (item.type === "folder") {
      setPathStack((prev) => [...prev, { id: item.id, name: item.name }]);
    }
  };

  // Go back → pop from stack, if at root → go back to user cards
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

  // Delete item from both maps
  const handleDelete = (item: FSItem) => {
    // TODO: call DELETE /api/files/${userId}/${item.id}
    setChildrenMap((prev) => {
      const updated = new Map(prev);
      const parentId = item.type === "file" ? item.parentId : "root";
      const siblings = (updated.get(parentId) ?? []).filter(
        (i) => i.id !== item.id,
      );
      updated.set(parentId, siblings);
      return updated;
    });
    setFsMap((prev) => {
      const updated = new Map(prev);
      updated.delete(item.id);
      return updated;
    });
  };

  return (
    <GlassCard className="h-full flex flex-col gap-2 overflow-hidden p-4">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={goUp}
          className="h-9 w-9 flex items-center justify-center rounded-xl
            hover:bg-white/30 transition-all duration-200"
        >
          <FaArrowLeft className="text-blue-800" />
        </button>

        {/* Breadcrumb — built from pathStack */}
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
                    ? "text-blue-900 font-bold" // current folder
                    : "text-blue-500 hover:text-blue-800",
                )}
              >
                {seg.name}
              </button>
            </span>
          ))}
        </div>

        <button
          onClick={() => {
            /* refresh */
          }}
          className="h-9 w-9 flex items-center justify-center rounded-xl
            hover:bg-white/30 transition-all duration-200"
        >
          <GrRefresh className="text-blue-800" />
        </button>
      </div>

      {/* ── File list ── */}
      <div className="flex-1 overflow-auto flex flex-col gap-1 min-h-0">
        {visibleItems.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-blue-600 italic">
            This folder is empty
          </div>
        )}
        {visibleItems.map((item) => (
          <FSRow
            key={item.id}
            item={item}
            onOpen={openFolder}
            onDelete={handleDelete}
          />
        ))}
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
            <FaFolder className="text-amber-400 flex-shrink-0" />
          ) : (
            <FaFile className="text-blue-400 flex-shrink-0" />
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
