"use client";

import FortuneCookieWidget from "../components/FortuneCookieWidget";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <main className="min-h-screen bg-slate-900">
      <FortuneCookieWidget />
    </main>
  );
};

export default Home;
