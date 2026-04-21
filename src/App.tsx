import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Coalition from "@/pages/Coalition";
import MapPage from "@/pages/Map";
import Timeline from "@/pages/Timeline";
import { ThemeProvider } from "next-themes";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" attribute="class" forcedTheme="dark">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/coalition" element={<Coalition />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="*" element={<Index />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;