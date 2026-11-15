"use client";
import React, { useEffect } from "react";
import { Flowbite } from "flowbite-react";
import LpHeader from "@/app/components/landingpage/header/Header";
import customTheme from "@/utils/theme/custom-theme";
import LpBanners from "@/app/components/landingpage/banner/banner";
import Footer from "@/app/components/landingpage/footer/Footer";
import AOS from "aos";
import 'aos/dist/aos.css';
const Landingpage = () => {
  useEffect(() => {
    AOS.init();
  }, []);
  return (
    <>
      <Flowbite theme={{ theme: customTheme }}>
        <div className="landingpage overflow-x-hidden">
          <LpHeader />
          <LpBanners />
          <Footer />
        </div>
      </Flowbite>
    </>
  );
};

export default Landingpage;
