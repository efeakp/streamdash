// src/pages/Gallery.js
import React from "react";
import member1 from "../assets/team/member1.jpg";
import member2 from "../assets/team/member2.jpg";
import member3 from "../assets/team/member3.jpg";
import member4 from "../assets/team/member4.jpg";

function Gallery() {
  const teamMembers = [
    { src: member1, name: "Efe Akpovwovwo", bio: "Project Lead & Developer" },
    { src: member2, name: "Lawrence Blay", bio: "Flod Risk Analyst" },
    { src: member3, name: "Iko Tambaya", bio: "Developer" },
    { src: member4, name: "CJ Williams", bio: "Communications" },
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default Gallery;
