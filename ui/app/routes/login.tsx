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

function LoginForm() {
  return (
    <div
      className="max-w-[50%] min-w-[30%] h-1/2 bg-transparent
      border border-solid border-[rgba(255,255,255,2)]
      rounded-[50px]  shadow-[0px_10px_50px_rgba(0,0,0,0.5)]  backdrop-blur-2xl
      bg-linear-to-br from-[rgba(255,255,255,0.5)] to-[rgba(255,255,255,0.4)] via-[rgba(255,255,255,0)] "
    ></div>
  );
}
