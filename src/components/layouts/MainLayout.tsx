"use client";

import React from "react";
import Header from "./partials/header";
import Footer from "./partials/footer";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-fill">{children}</main>

      {/* Footer pushed to bottom */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
