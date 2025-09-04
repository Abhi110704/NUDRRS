import React from 'react';
import {
  Box, Switch, Typography, Chip, Tooltip, useTheme,
  Fade, Slide, Paper
} from '@mui/material';
import {
  PlayArrow, Stop, Warning, Info
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const DemoToggle = () => {
  const { isDemoMode, toggleDemoMode } = useAuth();
  const theme = useTheme();

  const handleToggle = () => {
    toggleDemoMode();
  };

  return (
    <Slide direction="down" in={true} timeout={500}>
      <Paper sx={{
        p: 1.5,
        borderRadius: 3,
        background: isDemoMode 
          ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
          : 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
        color: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        border: '2px solid rgba(255,255,255,0.2)',
        position: 'relative',
        overflow: 'hidden',
        minWidth: 200
      }}>
        {/* Background Decoration */}
        <Box sx={{
          position: 'absolute',
          top: -10,
          right: -10,
          fontSize: '2rem',
          opacity: 0.1,
          transform: 'rotate(15deg)'
        }}>
          {isDemoMode ? '🎯' : '🚨'}
        </Box>

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isDemoMode ? (
              <PlayArrow sx={{ fontSize: 20 }} />
            ) : (
              <Stop sx={{ fontSize: 20 }} />
            )}
            
            <Box>
              <Typography variant="body2" sx={{ 
                fontWeight: 'bold',
                fontSize: '0.75rem',
                lineHeight: 1
              }}>
                {isDemoMode ? 'DEMO MODE' : 'LIVE MODE'}
              </Typography>
              <Typography variant="caption" sx={{ 
                opacity: 0.8,
                fontSize: '0.65rem',
                lineHeight: 1
              }}>
                {isDemoMode ? 'Training Data' : 'Real Reports'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={isDemoMode}
              onChange={handleToggle}
              sx={{
                '& .MuiSwitch-switchBase': {
                  color: 'rgba(255,255,255,0.8)',
                  '&.Mui-checked': {
                    color: 'white',
                    '& + .MuiSwitch-track': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                    },
                  },
                },
                '& .MuiSwitch-track': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                },
              }}
            />
            
            <Tooltip 
              title={isDemoMode 
                ? "Currently showing demo/training data. Switch to LIVE for real emergency reports."
                : "Currently showing real emergency reports. Switch to DEMO for training purposes."
              }
              arrow
              placement="top"
            >
              <Info sx={{ 
                fontSize: 16, 
                opacity: 0.8,
                cursor: 'help'
              }} />
            </Tooltip>
          </Box>
        </Box>

        {/* Status Indicator */}
        <Fade in={true} timeout={300}>
          <Box sx={{
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            height: 4,
            background: isDemoMode 
              ? 'linear-gradient(90deg, #4caf50 0%, #45a049 100%)'
              : 'linear-gradient(90deg, #f44336 0%, #d32f2f 100%)',
            borderRadius: '2px 2px 0 0',
            opacity: 0.8
          }} />
        </Fade>

        {/* Pulse Animation for Demo Mode */}
        {isDemoMode && (
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            animation: 'pulse 2s infinite',
            zIndex: 1
          }} />
        )}

        <style jsx>{`
          @keyframes pulse {
            0% {
              transform: translate(-50%, -50%) scale(0.8);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(2);
              opacity: 0;
            }
          }
        `}</style>
      </Paper>
    </Slide>
  );
};

export default DemoToggle;
