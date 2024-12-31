import { Switch, Route } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ThreatIntelligencePage from "./pages/ThreatIntelligencePage";
import NotificationSettingsPage from "./pages/NotificationSettingsPage";
import SecurityRecommendationsPage from "./pages/SecurityRecommendationsPage";
import ThreatSocialPage from "./pages/ThreatSocialPage";
import { useUser } from "./hooks/use-user";

function App() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/intelligence" component={ThreatIntelligencePage} />
      <Route path="/notifications" component={NotificationSettingsPage} />
      <Route path="/security" component={SecurityRecommendationsPage} />
      <Route path="/social" component={ThreatSocialPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold">404 Page Not Found</h1>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            The requested resource could not be found.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;