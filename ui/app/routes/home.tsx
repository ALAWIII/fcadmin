import { cn, GlassCard } from "~/lib";
import { GoSidebarExpand, GoSidebarCollapse } from "react-icons/go";
import { MdOutlinePersonAddAlt } from "react-icons/md";
import { useState } from "react";
import { GrRefresh } from "react-icons/gr";

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
      className=" text-2xl text-black  font-leckerli  font-bold
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
  return <GlassCard className="col-span-1"></GlassCard>;
}
function DashBoard({ cspan = "col-span-4" }) {
  return <GlassCard className={cn("", cspan)}></GlassCard>;
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
