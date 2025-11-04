import React from 'react';
import { motion } from 'framer-motion';
import './Login3DIllustration.css';

const Login3DIllustration = () => {
  return (
    <div className="illustration-3d">
      {/* Character sitting in chair */}
      <motion.div 
        className="character-3d"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {/* Chair */}
        <div className="armchair-3d">
          <div className="chair-seat" />
          <div className="chair-back" />
          <div className="chair-legs">
            <div className="chair-leg" />
            <div className="chair-leg" />
            <div className="chair-leg" />
            <div className="chair-leg" />
          </div>
        </div>
        
        {/* Character */}
        <div className="character-body-3d">
          {/* Head */}
          <motion.div 
            className="character-head-3d"
            animate={{ 
              rotate: [0, 2, -2, 0],
              y: [0, -3, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="hair-3d" />
            <div className="face-3d">
              <div className="eye-3d eye-left" />
              <div className="eye-3d eye-right" />
              <div className="mouth-3d" />
            </div>
          </motion.div>
          
          {/* Body */}
          <div className="character-torso-3d">
            <div className="shirt-3d" />
            {/* Laptop */}
            <motion.div 
              className="laptop-3d"
              animate={{ 
                rotateY: [0, 5, -5, 0],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="laptop-screen" />
              <div className="laptop-keyboard" />
            </motion.div>
          </div>
          
          {/* Legs */}
          <div className="character-legs-3d">
            <div className="leg-3d leg-left">
              <div className="pants-3d" />
              <div className="shoe-3d" />
            </div>
            <div className="leg-3d leg-right">
              <div className="pants-3d" />
              <div className="shoe-3d" />
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Cactus Plant */}
      <motion.div 
        className="cactus-3d"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="cactus-main" />
        <div className="cactus-branch branch-1" />
        <div className="cactus-branch branch-2" />
        <div className="cactus-pot" />
        <div className="cactus-spikes">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="spike" style={{ 
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: '2px',
              height: '4px',
              background: '#4a7c59',
              transform: `rotate(${Math.random() * 360}deg)`
            }} />
          ))}
        </div>
      </motion.div>
      
      {/* Floating elements for depth */}
      <motion.div 
        className="floating-circle circle-1"
        animate={{ 
          y: [0, -20, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="floating-circle circle-2"
        animate={{ 
          y: [0, 15, 0],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />
    </div>
  );
};

export default Login3DIllustration;

