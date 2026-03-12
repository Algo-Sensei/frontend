import './AboutUs.css'

import TeamCarousel, { TeamMember } from "./team-carousel/TeamCarousel";

import JPSingco from "../../assets/images/JPSingco.png";
import ZGTambiga from "../../assets/images/ZGTambiga.png";
import JFArdines from "../../assets/images/JFArdines.png";
import KRViovicente from "../../assets/images/KRViovicente.png";

const teamMembers: TeamMember[] = [
  {
    name: "John Paul Singco",
    image: JPSingco,
    role: "Project Manager & Main Developer",
    socials: {
      github: "https://github.com/FivePesos",
      email: "johnpaul5sing@gmail.com ",
    }
  },
  {
    name: "Zander Gene Tambiga",
    image: ZGTambiga,
    role: "Full Stack Developer",
    socials: {
      github: "https://github.com/zaapptt",
      email: "zaptromano@gmail.com",
    }
  },
  {
    name: "Jamill Francis Ardines",
    image: JFArdines,
    role: "Full Stack Developer & UI/UX Designer",
    socials: {
      github: "https://github.com/jamardines-dev",
      email: "jamardines16@gmail.com",
    }
  },
  {
    name: "Kenneth Reniel Viovicente",
    image: KRViovicente,
    role: "Documentation Lead & UI/UX Designer",
    socials: {
      github: "https://github.com/kennethviov",
      linkedin: "https://www.linkedin.com/in/kenneth-reniel-viovicente",
      email: "kennethviov@gmail.com",
    }
  },
]

const AboutUs = () => {
  return (
    <>
    <div className="about-us">

      <div 
        style={{ 
          maxWidth: "800px", 
          textAlign: "center" }}
      >

        <h2 
          style={{ 
            fontSize: "2.5rem", 
            color: "#ffffff", 
            marginBottom: "1rem", 
            fontFamily: "'Inter', sans-serif" }}
        >
          Who are we?
        </h2>
      </div>

      <div 
        style={{  
          maxWidth: "100%"}}
      >

        {/* Carousel */}
        <TeamCarousel members={teamMembers} />

      </div>

      <div 
        style={{ 
          maxWidth: "800px", 
          textAlign: "center" }}
      >
        <p 
          style={{ 
            fontSize: "1.1rem", 
            color: "#D9D9D9", 
            lineHeight: "1.6", 
            fontFamily: "'Inter', sans-serif" }}>
            We’re a development team from the University of Cebu working behind AlgoSensie, an AI-powered mentor designed to help developers of all levels strengthen their data structures and algorithm skills.
        </p>
        <p 
          style={{ 
            fontSize: "1.1rem", 
            color: "#D9D9D9", 
            lineHeight: "1.6", 
            fontFamily: "'Inter', sans-serif" }}>
            Our team blends different strengths to bring the project to life: John Paul leads as project manager and main developer, Zander builds across the full stack, Jam shapes smooth and responsive interfaces, and Kenneth oversees documentation while crafting the UI/UX. Guided by an Agile workflow, we collaborate to turn AlgoSensie into an accessible and supportive learning tool for devs everywhere.
        </p>
      </div>
    </div>
    </>
  );
};

export default AboutUs;