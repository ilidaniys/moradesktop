import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "bg-card shadow-lg",
          },
        }}
      />
    </div>
  );
}
