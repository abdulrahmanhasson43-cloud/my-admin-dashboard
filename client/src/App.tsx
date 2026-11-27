import { Route, Switch } from "wouter";
import Protected from "./components/site/protected";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Watch from "./pages/Watch";
import Account from "./pages/Account";
import Topup from "./pages/Topup";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Certificate from "./pages/Certificate";
import Share from "./pages/Share";
import Parent from "./pages/Parent";
import { SearchPage } from "./components/site/platform";
import { MobileNav } from "./components/site/mobile-nav";

// Every route the app serves. verify_webapp screenshots each one.
export default function App() {
  return (
    <>
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/courses" component={Courses} />
      <Route path="/course/:slug" component={CourseDetail} />
      <Route path="/watch/:lessonId">
        <Protected>
          <Watch />
        </Protected>
      </Route>
      <Route path="/account">
        <Protected>
          <Account />
        </Protected>
      </Route>
      <Route path="/certificate" component={Certificate} />
      <Route path="/certificate/:code" component={Certificate} />
      <Route path="/share/:token" component={Share} />
      <Route path="/search" component={SearchPage} />
      <Route path="/topup">
        <Protected>
          <Topup />
        </Protected>
      </Route>
      <Route path="/parent">
        <Protected>
          <Parent />
        </Protected>
      </Route>
      <Route path="/admin">
        <Protected>
          <Admin />
        </Protected>
      </Route>
      <Route component={NotFound} />
    </Switch>
      <MobileNav />
    </>
  );
}
