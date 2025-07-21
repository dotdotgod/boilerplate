import { Route, Routes } from "react-router";
import SignIn from "./pages/sign-in";
import SignUp from "./pages/sign-up";

function App() {
  return (
    <>
      <Routes>
        <Route index element={<SignIn />} />
        {/* <Route path="about" element={<About />} /> */}

        {/* <Route element={<AuthLayout />}> */}
        <Route path="sign-in" element={<SignIn />} />
        <Route path="sign-up" element={<SignUp />} />
        {/* <Route path="register" element={<Register />} /> */}
        {/* </Route> */}

        {/* <Route path="concerts">
          <Route index element={<ConcertsHome />} />
          <Route path=":city" element={<City />} />
          <Route path="trending" element={<Trending />} />
        </Route> */}
      </Routes>
    </>
  );
}

export default App;
