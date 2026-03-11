import React, { useState } from 'react'
import './TeamCarousel.css'

export interface TeamMember {
  name: string
  image: string
  role?: string
  socials: {
    github?: string
    linkedin?: string
    email?: string
  }
}

interface Props {
	members: TeamMember[]
}

const TeamCarousel: React.FC<Props> = ({ members }) => {
	const [paused, setPaused] = useState(false);

  const loopMembers = [...members, ...members,];

  return (
    <div className='carousel-wrapper'>

      <div
        className={`carousel-track ${paused ? "paused" : ""}`}>
        {loopMembers.map((member, i) => (
          <div
            key={i}
            className='carousel-item'
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <img src={member.image} alt={member.name} className='carousel-image' />

            <div className='overlay'>

              <h4 style={{ fontFamily: 'Inter' }}>{member.name}</h4>

              {member.role && <p style={{ fontFamily: 'Inter', fontSize: '0.9rem', marginTop: '0.3rem' }}>{member.role}</p>}

              {/* TODO: replace socials with icons */}
              <div className="socials">
                {member.socials.github && (
                  <a href={member.socials.github} target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                )}
                {member.socials.linkedin && (
                  <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                )}
                {member.socials.email && (
                  <a href={`mailto:${member.socials.email}`}>
                    Email
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default TeamCarousel;