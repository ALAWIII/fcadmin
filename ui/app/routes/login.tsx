import { useState } from "react";
import { GlassCard } from "~/components/custom/glassContainer";
import { cn } from "~/lib/utils";
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
      className="text-3xl text-black/80 font-leckerli font-bold"
      style={{
        WebkitTextStroke: "2px rgba(255,255,255,0.9)",
        textShadow: "0px 0px 15px rgba(255,255,255,0.5)",
      }}
    >
      FC admin
    </p>
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

//---
async function handleSubmit(
  e: React.SubmitEvent<HTMLFormElement>,
  setError: React.Dispatch<React.SetStateAction<string>>,
) {
  e.preventDefault();
  const form = new FormData(e.currentTarget);

  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: form.get("username"),
      password: form.get("password"),
    }),
  });

  if (!res.ok) {
    setError("Invalid credentials");
    return;
  }

  // Cookie is set by server, just redirect
  window.location.href = "/dashboard";
}
function LoginForm() {
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  return (
    <GlassCard
      className="flex flex-col items-center"
      size="w-[90%] max-w-[600px] min-w-[280px] min-h-[50%]"
    >
      <LoginTitle />
      <form
        onSubmit={(evt) => {
          handleSubmit(evt, setError);
        }}
        className="flex flex-col items-center justify-center flex-1 w-full"
      >
        <UsernameCard />
        <PasswordCard type={show ? "text" : "password"} />
        <ShowPassword show={show} setShow={setShow} />
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        <LoginButton />
      </form>
    </GlassCard>
  );
}
function InputCard({ txt = "", type = "text" }) {
  return (
    <GlassCard
      className="m-2.5 p-4 hover:bg-amber-50/30"
      size="w-[70%] min-h-[0px]"
      shadow="shadow-[0px_10px_10px_rgba(0,0,0,0.5)]"
    >
      <input
        name={txt} // ← add name so formData can read it
        className="w-full h-full caret-blue-400 outline-0 placeholder:text-center text-center text-blue-950 text-xs"
        placeholder={txt}
        type={type}
      />
    </GlassCard>
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
        type="submit" // ← must be submit
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
