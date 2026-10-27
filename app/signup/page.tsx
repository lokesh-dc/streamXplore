import AuthForm from "@/components/auth/AuthForm";
import getAuthVisuals from "@/dataFetchings/authVisuals";

export const metadata = {
  title: "Sign Up",
  description: "Create your HookedOnMovies account",
};

export default async function SignupPage() {
  const visuals = await getAuthVisuals();
  return <AuthForm mode="signup" visuals={visuals} />;
}
