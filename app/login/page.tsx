import AuthForm from "@/components/auth/AuthForm";
import getAuthVisuals from "@/dataFetchings/authVisuals";

export const metadata = {
  title: "Sign In",
  description: "Sign in to your HookedOnMovies account",
};

export default async function LoginPage() {
  const visuals = await getAuthVisuals();
  return <AuthForm mode="login" visuals={visuals} />;
}
