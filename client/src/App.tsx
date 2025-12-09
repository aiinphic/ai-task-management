import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Departments from "./pages/Departments";
// import { useEffect } from "react";
// import { initMockData } from "./utils/initMockData";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/departments"} component={Departments} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // 初始化模擬資料（已停用，改用 Home.tsx 中的 initial-tasks.json）
  // useEffect(() => {
  //   initMockData();
  // }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
