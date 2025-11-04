import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './LoginDoodles.css';

const LoginDoodles = ({ 
  isWatching, 
  isLookingAtButton, 
  isShakingHead, 
  isNodding, 
  isLookingAway,
  passwordVisible 
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const character1Ref = useRef(null);
  const character2Ref = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calculateEyePosition = (characterRef, eyeIndex) => {
    if (!characterRef.current || isLookingAway || isShakingHead || isNodding) {
      return { x: 0, y: 0 };
    }

    const rect = characterRef.current.getBoundingClientRect();
    const headCenterX = rect.left + rect.width / 2;
    const headCenterY = rect.top + 50; // Approximate head center
    const headRadius = 25; // Half of head width (50px / 2)
    const eyeRadius = 8; // Max distance eyes can move
    
    const dx = mousePosition.x - headCenterX;
    const dy = mousePosition.y - headCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return { x: 0, y: 0 };
    
    // Limit eye movement to stay within head
    const maxDistance = headRadius - eyeRadius;
    const limitedDistance = Math.min(distance, maxDistance);
    const angle = Math.atan2(dy, dx);
    
    // Offset for left/right eye (left eye: -4px, right eye: +4px from center)
    const eyeOffsetX = eyeIndex === 0 ? -4 : 4;
    
    const eyeX = Math.cos(angle) * (limitedDistance * 0.3) + eyeOffsetX;
    const eyeY = Math.sin(angle) * (limitedDistance * 0.3);
    
    // Override if looking at button
    if (isLookingAtButton) {
      return { x: eyeIndex === 0 ? -2 : 2, y: -2 };
    }
    
    return { x: eyeX, y: eyeY };
  };

  const eye1Pos1 = calculateEyePosition(character1Ref, 0);
  const eye2Pos1 = calculateEyePosition(character1Ref, 1);
  const eye1Pos2 = calculateEyePosition(character2Ref, 0);
  const eye2Pos2 = calculateEyePosition(character2Ref, 1);
  return (
    <div className="doodles-container">
      <motion.div 
        ref={character1Ref}
        className="doodle-character"
        animate={{
          y: isLookingAtButton ? -10 : 0,
          rotate: isLookingAway ? -15 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Head */}
        <div className="doodle-head">
          {/* Eyes */}
          <div className="doodle-eyes">
            <motion.div 
              className="doodle-eye"
              animate={{
                x: isLookingAway ? -5 : eye1Pos1.x,
                y: isLookingAway ? 0 : eye1Pos1.y,
                scale: isShakingHead ? [1, 0.8, 1] : isNodding ? [1, 1.2, 1] : 1,
              }}
              transition={{ 
                duration: isShakingHead ? 0.2 : 0.15,
                repeat: isShakingHead ? 3 : 0,
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
            />
            <motion.div 
              className="doodle-eye"
              animate={{
                x: isLookingAway ? -5 : eye2Pos1.x,
                y: isLookingAway ? 0 : eye2Pos1.y,
                scale: isShakingHead ? [1, 0.8, 1] : isNodding ? [1, 1.2, 1] : 1,
              }}
              transition={{ 
                duration: isShakingHead ? 0.2 : 0.15,
                repeat: isShakingHead ? 3 : 0,
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
            />
          </div>
          
          {/* Mouth */}
          <motion.div 
            className="doodle-mouth"
            animate={{
              scaleY: isNodding ? 1.2 : isShakingHead ? 0.8 : 1,
              rotate: isShakingHead ? [0, -5, 5, -5, 0] : 0,
            }}
            transition={{ 
              duration: isShakingHead ? 0.5 : 0.3,
              repeat: isShakingHead ? 1 : 0,
            }}
          />
        </div>
        
        {/* Body */}
        <div className="doodle-body" />
        
        {/* Arms */}
        <motion.div 
          className="doodle-arm doodle-arm-left"
          animate={{
            rotate: isNodding ? [0, 10, -10, 10, 0] : 0,
          }}
          transition={{ 
            duration: 0.5,
            repeat: isNodding ? 1 : 0,
          }}
        />
        <motion.div 
          className="doodle-arm doodle-arm-right"
          animate={{
            rotate: isNodding ? [0, -10, 10, -10, 0] : 0,
          }}
          transition={{ 
            duration: 0.5,
            repeat: isNodding ? 1 : 0,
          }}
        />
        
        {/* Speech bubble for "NO" */}
        {isShakingHead && (
          <motion.div
            className="speech-bubble speech-no"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            NO
          </motion.div>
        )}
        
        {/* Speech bubble for "YES" */}
        {isNodding && (
          <motion.div
            className="speech-bubble speech-yes"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            ✓
          </motion.div>
        )}
      </motion.div>
      
      {/* Second doodle character */}
      <motion.div 
        ref={character2Ref}
        className="doodle-character doodle-character-2"
        animate={{
          y: isLookingAtButton ? -10 : 0,
          rotate: isLookingAway ? 15 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="doodle-head">
          <div className="doodle-eyes">
            <motion.div 
              className="doodle-eye"
              animate={{
                x: isLookingAway ? 5 : eye1Pos2.x,
                y: isLookingAway ? 0 : eye1Pos2.y,
                scale: isShakingHead ? [1, 0.8, 1] : isNodding ? [1, 1.2, 1] : 1,
              }}
              transition={{ 
                duration: isShakingHead ? 0.2 : 0.15,
                repeat: isShakingHead ? 3 : 0,
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
            />
            <motion.div 
              className="doodle-eye"
              animate={{
                x: isLookingAway ? 5 : eye2Pos2.x,
                y: isLookingAway ? 0 : eye2Pos2.y,
                scale: isShakingHead ? [1, 0.8, 1] : isNodding ? [1, 1.2, 1] : 1,
              }}
              transition={{ 
                duration: isShakingHead ? 0.2 : 0.15,
                repeat: isShakingHead ? 3 : 0,
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
            />
          </div>
          <motion.div 
            className="doodle-mouth"
            animate={{
              scaleY: isNodding ? 1.2 : isShakingHead ? 0.8 : 1,
              rotate: isShakingHead ? [0, 5, -5, 5, 0] : 0,
            }}
            transition={{ 
              duration: isShakingHead ? 0.5 : 0.3,
              repeat: isShakingHead ? 1 : 0,
            }}
          />
        </div>
        <div className="doodle-body" />
        <motion.div 
          className="doodle-arm doodle-arm-left"
          animate={{
            rotate: isNodding ? [0, 10, -10, 10, 0] : 0,
          }}
          transition={{ 
            duration: 0.5,
            repeat: isNodding ? 1 : 0,
          }}
        />
        <motion.div 
          className="doodle-arm doodle-arm-right"
          animate={{
            rotate: isNodding ? [0, -10, 10, -10, 0] : 0,
          }}
          transition={{ 
            duration: 0.5,
            repeat: isNodding ? 1 : 0,
          }}
        />
      </motion.div>
    </div>
  );
};

export default LoginDoodles;

