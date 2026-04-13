import { useState } from "react";
import { cn, GlassCard } from "~/lib";

export default function LoginPage() {
  return (
    <div
      style={{ backgroundImage: "url('/clouds_sunset.jpg')" }}
      className="flex h-dvh bg-size-[100%_100%]  bg-no-repeat items-center justify-center"
    >
      <LoginForm />
    </div>
  );
}
function LoginTitle() {
  return (
    <p
      className="text-3xl text-black/40  font-lobster font-bold"
      style={{
        WebkitTextStroke: "1px rgba(255,255,255,0.9)",
        textShadow: "0px 0px 15px rgba(255,255,255,0.5)",
      }}
    >
      fc admin
    </p>
  );
}
function LoginForm() {
  const [show, setShow] = useState(false);
  return (
    <GlassCard
      className="flex flex-col items-center" // remove justify-center & pb-40
      size="max-w-[50%] min-w-[30%] h-1/2"
    >
      {/* Pinned to top */}
      <LoginTitle />

      {/* Inputs centered in remaining space */}
      <div className="flex flex-col items-center justify-center flex-1 w-full">
        <UsernameCard />
        <PasswordCard type={show ? "text" : "password"} />
        <ShowPassword show={show} setShow={setShow} />
        <LoginButton />
      </div>
    </GlassCard>
  );
}
function PasswordCard({ type = "password" }) {
  return <InputCard txt="password" type={type}></InputCard>;
}

function UsernameCard() {
  return <InputCard txt="username" type="text"></InputCard>;
}
interface ShowPasswordProps {
  show: boolean;
  setShow: (value: boolean) => void;
}

function ShowPassword({ show, setShow }: ShowPasswordProps) {
  return (
    <div className="flex flex-row items-start gap-2 mt-2">
      <input
        type="checkbox"
        id="show-password"
        checked={show} // ✅ controlled input
        onChange={() => setShow(!show)}
      />
      <label htmlFor="show-password" className="text-xs text-indigo-950">
        show password
      </label>
    </div>
  );
}

function LoginButton() {
  const [clicked, setClicked] = useState(false);

  return (
    <GlassCard
      size="w-[40%] min-h-[0px]"
      shadow="shadow-[0px_10px_10px_rgba(0,0,0,0.5)]"
      className={cn(
        "text-center m-2.5 p-1 hover:bg-amber-50/10",
        clicked && "bg-white/20",
      )}
    >
      <button
        className="w-full h-full text-white transition-colors duration-200 active:text-blue-800"
        onMouseDown={() => setClicked(true)}
        onMouseUp={() => setClicked(false)}
        onMouseLeave={() => setClicked(false)}
      >
        login
      </button>
    </GlassCard>
  );
}
function InputCard({ txt = "", type = "text" }) {
  return (
    <GlassCard
      className="m-2.5 p-4 hover:bg-amber-50/30"
      size="w-[40%] min-h-[0px]"
      shadow="shadow-[0px_10px_10px_rgba(0,0,0,0.5)]"
    >
      <input
        className="w-full h-full caret-blue-400 outline-0 placeholder:text-center text-center text-blue-950 text-xs"
        placeholder={txt}
        type={type}
      ></input>
    </GlassCard>
  );
}
