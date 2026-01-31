// src/pages/Gallery.js
import React from "react";
import member1 from "../assets/team/member1.jpg";
import member2 from "../assets/team/member2.jpg";
import member3 from "../assets/team/member3.jpg";
import member4 from "../assets/team/member4.jpg";
import member5 from "../assets/team/member5.jpg";

function Gallery() {
  const teamMembers = [
    { 
      src: member1, 
      name: "Efe Akpovwovwo", 
      bio: "Project Lead & Developer",
      linkedin: "https://www.linkedin.com/in/efe-akpovwovwo-395abb35" 
    },
    { 
      src: member2, 
      name: "Lawrence Blay", 
      bio: "Flood Risk Analyst"
    },
    { 
      src: member3, 
      name: "Iko Tambaya", 
      bio: "Developer"
    },
    { 
      src: member4, 
      name: "CJ Williams", 
      bio: "Communications"
    },
    { 
      src: member5, 
      name: "Dr. Julius Mboli", 
      bio: "Project Mentor"
    },
  ];

  return (
    <div style={{ textAlign: "left" }}>
      <h2>Meet Our Team</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          gap: "40px",
          flexWrap: "wrap",
          marginTop: "20px",
        }}
      >
        {teamMembers.map((member, index) => (
          <div key={index} style={{ width: "200px" }}>
            <img
              src={member.src}
              alt={member.name}
              style={{
                width: "200px",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
              }}
            />
            <h3 style={{ margin: "10px 0 5px" }}>{member.name}</h3>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>
              {member.bio}
            </p>

            {/* LinkedIn link */}
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  marginTop: "8px",
                  fontSize: "0.9rem",
                  color: "#0A66C2",
                  textDecoration: "none",
                  fontWeight: "bold"
                }}
              >
                ↗ LinkedIn Profile
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Gallery;
