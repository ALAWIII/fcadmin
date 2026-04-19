import { cn, GlassCard } from "~/lib";
import { GoSidebarExpand, GoSidebarCollapse } from "react-icons/go";
import { MdOutlinePersonAddAlt } from "react-icons/md";
import { useState } from "react";
import { GrRefresh } from "react-icons/gr";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div
      style={{ backgroundImage: "url('/clouds_sunset.jpg')" }}
      className="grid grid-cols-5 grid-rows-[auto_1fr] h-dvh bg-size-[100%_100%]  bg-no-repeat p-4 gap-4"
    >
      <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {sidebarOpen ? <SideBar /> : null}
      <DashBoard cspan={sidebarOpen ? "col-span-4" : "col-span-full"} />
    </div>
  );
}
interface ShowSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
}
function TopBar({ sidebarOpen, setSidebarOpen }: ShowSidebarProps) {
  return (
    <GlassCard
      className="flex flex-row justify-between col-span-full items-center "
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
      className=" text-2xl text-black  font-inter  font-bold
      hover:bg-white/10 hover:pl-2 hover:pr-2
      hover:shadow-[0px_0px_20px_rgba(255,255,255,0.5)] hover:rounded-2xl"
      style={{
        WebkitTextStroke: "2px rgba(255,255,255,0.9)",
        textShadow: "0px 0px 15px rgba(255,255,255,0.5)",
      }}
    >
      FC admin
    </p>
  );
}
function SideBar() {
  return (
    <GlassCard className="flex flex-col col-span-1 overflow-auto gap-2 ">
      <Storage text="max : 50GB" />
      <Storage text="available: 20GB" />
      <LogoutButton></LogoutButton>
    </GlassCard>
  );
}
function LogoutButton() {
  return (
    <GlassCard
      className=" hover:bg-white/10 p-0 mt-auto"
      gradient="bg-linear-to-b from-red-600/70 via-blue-600/20 to-white/50 hover:from-red-600/80 hover:to-white/70
        transition-all duration-200"
    >
      <button
        className="text-center w-full h-full p-5
        active:bg-linear-to-b active:from-red-600/60 active:to-white/30 active:via-blue-600/20
        active:shadow-[0px_0px_10px_rgba(255,0,0,0.5)]
        active:rounded-2xl
        font-inter font-bold text-blue-800
        "
      >
        Logout all users
      </button>
    </GlassCard>
  );
}
function Storage({ text = "" }) {
  return (
    <GlassCard className="text-nowrap overflow-x-scroll text-black font-bold italic text-shadow-2xs text-shadow-amber-50 text-center">
      <span>{text}</span>
    </GlassCard>
  );
}

function MyDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none" asChild>
        <button className=" active:bg-white/50 active:rounded-2xl hover:shadow-[0px_0px_20px_rgba(255,255,255,0.5)] hover:rounded-2xl h-full w-full">
          <BsThreeDotsVertical className="h-full w-full"></BsThreeDotsVertical>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="bg-transparent backdrop-blur-xs hover:bg-white/50 min-w-fit"
        align="end"
      >
        <DropdownMenuItem
          onClick={() => console.log("Action 1")}
          className="justify-center"
        >
          Details
        </DropdownMenuItem>
        <DropdownMenuItem
          className="justify-center"
          onClick={() => console.log("Action 2")}
        >
          Update
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className=" focus:bg-red-500/50 justify-center"
          onClick={() => console.log("Action 3")}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserOptionButton() {
  return (
    <div className="h-8 justify-self-end-safe">
      <MyDropdown />
    </div>
  );
}
function DashBoard({ cspan = "col-span-4" }) {
  const records = [];
  for (let i = 0; i < 9; i++) {
    records.push(
      <Row className="">
        {["ali", "ali@shawarma.com", "5GB", "3GB"].map((v) => (
          <UserValue key={i} value={v} />
        ))}
        <UserOptionButton />
      </Row>,
    );
  }

  return (
    <GlassCard className={cn("flex flex-col overflow-scroll gap-2  ", cspan)}>
      <Row className="border-none backdrop-blur-none shadow-none ">
        {["username", "email", "max space", "used space", ""].map((v) => (
          <UserValue value={v} />
        ))}
      </Row>
      {records}
    </GlassCard>
  );
}

function Row({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <GlassCard
      className={cn(
        className,
        "flex flex-row justify-between font-inter text-xl text-center text-blue-950/60 items-center p-2 h-fit ",
      )}
    >
      {children}
    </GlassCard>
  );
}
function UserValue({ value = "" }) {
  return <span className="overflow-scroll h-full text-center ">{value}</span>;
}
function SideBarButton({ sidebarOpen, setSidebarOpen }: ShowSidebarProps) {
  return (
    <button
      className="hover:bg-white/30 hover:shadow-[0px_10px_20px_rgba(255,255,255,0.5)] rounded-2xl p-3 w-14 h-14"
      onClick={() => setSidebarOpen(!sidebarOpen)}
    >
      {sidebarOpen ? (
        <GoSidebarCollapse className="w-full h-full text-red-600 " />
      ) : (
        <GoSidebarExpand className="w-full h-full  text-blue-700" />
      )}
    </button>
  );
}

function RefreshButton() {
  return (
    <button className="p-4 w-14 h-14">
      <GrRefresh className="active:bg-amber-50/30 active:text-red-500 active:rounded-full active:shadow-[0px_0px_20px_rgba(255,0,0,0.4)] w-full h-full" />
    </button>
  );
}

function AddUserButton() {
  return (
    <button className="p-4 w-14 h-14">
      <MdOutlinePersonAddAlt className="active:bg-amber-50/30 active:text-green-500 active:rounded-es-sm active:shadow-[0px_0px_20px_rgba(0,255,255,0.5)] w-full h-full" />
    </button>
  );
}
