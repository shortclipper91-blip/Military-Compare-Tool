import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import { ThemeProvider } from "next-themes";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" attribute="class" forcedTheme="dark">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<Index />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;