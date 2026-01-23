import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import LoginForm from "@/auth/login/loginForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SignUp from "@/auth/signUp/sign-up";

const Authentication = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>

        <CardDescription>
          Enter your credentials to access the dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-100">
          <TabsList>
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Signup</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="signup">{<SignUp />}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Authentication;
