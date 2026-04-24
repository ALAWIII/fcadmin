import { GoSidebarExpand, GoSidebarCollapse } from "react-icons/go";
import { MdOutlinePersonAddAlt } from "react-icons/md";
import { useState } from "react";
import { GrRefresh } from "react-icons/gr";
import { cn } from "~/lib/utils";
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
  DialogClose,
  DialogTrigger,
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { FileBrowser } from "~/components/custom/fbrowser";
import { GlassCard } from "~/components/custom/glassContainer";
import { useUserStore, type User } from "~/lib/models";
import {
  addUser,
  fetchUsers,
  logoutUsers,
  removeUser,
  updateUser,
} from "~/lib/api";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormFields = Pick<
  User,
  "username" | "email" | "storageQuotaBytes" | "storageUsedBytes"
>;

// Strict union so dialog state can only be one of these values
type DialogMode = DMode | null;
enum DMode {
  delete,
  details,
  update,
}

// ─── Home ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      style={{
        backgroundImage: "url('/clouds_sunset.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      className="grid h-dvh grid-cols-5 grid-rows-[auto_1fr] gap-4 bg-position-[100%_100%] bg-no-repeat p-4"
    >
      <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {sidebarOpen && <SideBar />}
      <DashBoard cspan={sidebarOpen ? "col-span-4" : "col-span-full"} />
    </div>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

interface ShowSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
}

function TopBar({ sidebarOpen, setSidebarOpen }: ShowSidebarProps) {
  return (
    <GlassCard
      className="col-span-full flex flex-row items-center justify-between"
      padding="p-4"
    >
      <SideBarButton
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <TitleBar />
      <div className="flex flex-row items-center gap-4">
        <AddUserButton />
        <RefreshButton />
      </div>
    </GlassCard>
  );
}

function TitleBar() {
  return (
    <p
      className="font-inter text-2xl font-bold text-black
      hover:rounded-2xl hover:bg-white/10 hover:px-2
      hover:shadow-[0px_0px_20px_rgba(255,255,255,0.5)]"
      style={{
        WebkitTextStroke: "2px rgba(255,255,255,0.9)",
        textShadow: "0px 0px 15px rgba(255,255,255,0.5)",
      }}
    >
      FC admin
    </p>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function SideBar() {
  return (
    <GlassCard className="col-span-1 flex flex-col gap-2 overflow-auto">
      <Storage text="max : 50GB" />
      <Storage text="available: 20GB" />
      <LogoutButton />
    </GlassCard>
  );
}

function LogoutButton() {
  return (
    <GlassCard
      className="mt-auto p-0 hover:bg-white/10"
      gradient="bg-linear-to-b from-red-600/70 via-blue-600/20 to-white/50
        hover:from-red-600/80 hover:to-white/70 transition-all duration-200"
    >
      <button
        className="h-full w-full p-5 text-center font-inter font-bold text-blue-800
        active:rounded-2xl active:bg-linear-to-b active:from-red-600/60
        active:via-blue-600/20 active:to-white/30
        active:shadow-[0px_0px_10px_rgba(255,0,0,0.5)]"
        onClick={logoutUsers}
      >
        Logout all users
      </button>
    </GlassCard>
  );
}

function Storage({ text = "" }: { text?: string }) {
  return (
    <GlassCard className="overflow-x-auto text-nowrap text-center font-bold italic text-black text-shadow-2xs text-shadow-amber-50">
      <span>{text}</span>
    </GlassCard>
  );
}

// ─── UserActionsDropdown ──────────────────────────────────────────────────────

export function UserActionsDropdown({
  user,
  onBrowse,
}: {
  user: User;
  onBrowse: () => void;
}) {
  const [dialog, setDialog] = useState<DialogMode>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<FormFields>({
    username: user.username,
    email: user.email,
    storageUsedBytes: user.storageUsedBytes,
    storageQuotaBytes: user.storageQuotaBytes,
  });

  const closeDialog = () => setDialog(null);

  // Call update API with the current form values
  const handleSave = async () => {
    setLoading(true);

    try {
      await updateUser(form, user.id);
      closeDialog();
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Call delete API then remove user from UI
  const handleDelete = async () => {
    setLoading(true);
    await removeUser(user.id);
    closeDialog();

    setLoading(false);
  };

  return (
    <>
      {/* ── Trigger dropdown ── */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            Actions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onBrowse}> Browse Files</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog(DMode.details)}>
            Details
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDialog(DMode.update)}>
            Update
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setDialog(DMode.delete)}
            className="text-red-500"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Delete: AlertDialog (shadcn's recommended component for destructive actions) ── */}
      <AlertDialog
        open={dialog === DMode.delete}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{user.username}"?</AlertDialogTitle>
            <AlertDialogDescription className="text-red-500">
              ⚠️ This will permanently delete the user and all associated
              files/folders. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
              onClick={handleDelete}
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Details: read-only info grid ── */}
      <Dialog open={dialog === DMode.details} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">ID</span>
            <span>{user.id}</span>
            <span className="text-muted-foreground">Username</span>
            <span>{user.username}</span>
            <span className="text-muted-foreground">Email</span>
            <span>{user.email}</span>
            <span className="text-muted-foreground">Created At</span>
            <span>{user.createdAt}</span>
            <span className="text-muted-foreground">Used Space</span>
            <span>{user.storageUsedBytes}</span>
            <span className="text-muted-foreground">Max Space</span>
            <span>{user.storageQuotaBytes}</span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Update: editable form ── */}
      <Dialog open={dialog === DMode.update} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {(
              [
                { label: "Username", key: "username" },
                { label: "Email", key: "email" },
                { label: "Used Space", key: "storageUsedBytes" },
                { label: "Max Space", key: "storageQuotaBytes" },
              ] as const
            ).map(({ label, key }) => {
              const isNumberField = [
                "storageUsedBytes",
                "storageQuotaBytes",
              ].includes(key);
              const dataType = isNumberField ? "number" : "string";
              return (
                <div key={key} className="grid gap-1">
                  <Label>{label}</Label>
                  <Input
                    type={dataType}
                    value={form[key] ?? ""}
                    onChange={(e) => {
                      const value = isNumberField
                        ? Number(e.target.value)
                        : e.target.value;

                      setForm((prev) => ({ ...prev, [key]: value }));
                    }}
                  />
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={loading} onClick={closeDialog}>
              Cancel
            </Button>
            <Button disabled={loading} onClick={handleSave}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function UserOptionButton({
  user,
  onBrowse,
}: {
  user: User;
  onBrowse: () => void;
}) {
  return (
    <div className="h-8 justify-self-end">
      <UserActionsDropdown user={user} onBrowse={onBrowse} />
    </div>
  );
}

function UsersRecords({ onSelectUser }: { onSelectUser: (u: User) => void }) {
  const users = useUserStore((state) => state.users); // ← add this

  return (
    <>
      <Row className="border-none shadow-none backdrop-blur-none font-semibold">
        {["username", "email", "max space", "used space", ""].map((v) => (
          <UserValue key={v} value={v} />
        ))}
      </Row>

      {users.map(
        (
          user, // ← use this
        ) => (
          <Row key={user.id}>
            <UserValue value={user.username} />
            <UserValue value={user.email} />
            <UserValue value={`${user.storageQuotaBytes}`} />
            <UserValue value={`${user.storageUsedBytes}`} />
            <UserOptionButton user={user} onBrowse={() => onSelectUser(user)} />
          </Row>
        ),
      )}
    </>
  );
}

function DashBoard({ cspan = "col-span-4" }: { cspan?: string }) {
  const [activeUser, setActiveUser] = useState<User | null>(null);

  return (
    <GlassCard className={cn("flex flex-col gap-2 overflow-auto", cspan)}>
      {activeUser ? (
        <FileBrowser
          userId={activeUser.id}
          onBack={() => setActiveUser(null)}
        />
      ) : (
        <UsersRecords onSelectUser={setActiveUser} />
      )}
    </GlassCard>
  );
}
function Row({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <GlassCard
      className={cn(
        "flex h-fit flex-row items-center justify-between p-2 text-center font-inter text-xl text-blue-950/60",
        className,
      )}
    >
      {children}
    </GlassCard>
  );
}

function UserValue({ value = "" }: { value?: string }) {
  return <span className="max-w-55 overflow-x-auto text-center">{value}</span>;
}

// ─── Small buttons ────────────────────────────────────────────────────────────

function SideBarButton({ sidebarOpen, setSidebarOpen }: ShowSidebarProps) {
  return (
    <button
      className="h-14 w-14 rounded-2xl p-3 hover:bg-white/30 hover:shadow-[0px_10px_20px_rgba(255,255,255,0.5)]"
      onClick={() => setSidebarOpen(!sidebarOpen)}
    >
      {sidebarOpen ? (
        <GoSidebarCollapse className="h-full w-full text-red-600" />
      ) : (
        <GoSidebarExpand className="h-full w-full text-blue-700" />
      )}
    </button>
  );
}

function RefreshButton() {
  return (
    <button className="h-14 w-14 p-4" onClick={fetchUsers}>
      <GrRefresh className="h-full w-full rounded-full active:bg-amber-50/30 active:text-red-500 active:shadow-[0px_0px_20px_rgba(255,0,0,0.4)]" />
    </button>
  );
}

export function AddUserButton() {
  const [dialog, setDialog] = useState(false);
  const closeDialog = () => setDialog(false);
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    await addUser(e);
    closeDialog();
  };

  return (
    <Dialog open={dialog} onOpenChange={setDialog}>
      {/* 1. Let Shadcn handle the open/close state automatically */}
      <DialogTrigger asChild>
        <button
          className="h-14 w-14 p-4 hover:bg-muted transition-colors rounded-md"
          onClick={() => setDialog(true)}
        >
          <MdOutlinePersonAddAlt className="h-full w-full active:text-green-500 active:shadow-[0px_0px_20px_rgba(0,255,255,0.5)]" />
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new user</DialogTitle>
        </DialogHeader>

        {/* 2. Wrap inputs in a form to handle submission */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input id="username" name="username" type="text" required />
              <FieldDescription>Choose a username</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" required />
              <FieldDescription>Choose a unique unused email</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" name="password" type="password" required />
              <FieldDescription>Choose a strong password</FieldDescription>
            </Field>
          </FieldGroup>

          <DialogFooter>
            {/* 3. Use asChild so we don't render a button inside a button */}
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
