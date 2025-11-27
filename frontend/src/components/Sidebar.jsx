import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.nav`
  width: 280px;
  background: linear-gradient(180deg, #12121e 0%, #0a0a14 100%);
  border-right: 1px solid #2a2a4a;
  padding: 30px 0;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
`;

const Logo = styled.div`
  padding: 0 30px 30px;
  border-bottom: 1px solid #2a2a4a;
  margin-bottom: 30px;
`;

const LogoText = styled.h1`
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoIcon = styled.span`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  -webkit-text-fill-color: white;
`;

const LogoSubtext = styled.span`
  font-size: 11px;
  color: #5a5a7a;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-top: 5px;
  display: block;
  -webkit-text-fill-color: #5a5a7a;
`;

const NavItems = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 0 15px;
`;

const NavItemLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  border-radius: 12px;
  color: #8888aa;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background: rgba(108, 92, 231, 0.1);
    color: #a29bfe;
  }

  &.active {
    background: linear-gradient(90deg, rgba(108, 92, 231, 0.2) 0%, rgba(108, 92, 231, 0.05) 100%);
    color: #fff;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 60%;
      background: linear-gradient(180deg, #6c5ce7, #a29bfe);
      border-radius: 0 4px 4px 0;
    }
  }
`;

const NavIcon = styled.span`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.active ? 'rgba(108, 92, 231, 0.2)' : 'rgba(255, 255, 255, 0.03)'};
  border-radius: 10px;
  font-size: 16px;
`;

const NavLabel = styled.span`
  flex: 1;
`;

const NavBadge = styled.span`
  background: ${props => props.danger ? '#ff4757' : '#6c5ce7'};
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 10px;
`;

const StatusSection = styled.div`
  padding: 20px 25px;
  border-top: 1px solid #2a2a4a;
  margin-top: auto;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: ${props => props.active ? '#00d26a' : '#ff4757'};
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.active ? '#00d26a' : '#ff4757'};
    animation: ${props => props.active ? 'pulse 2s infinite' : 'none'};
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(0, 210, 106, 0.4); }
    70% { box-shadow: 0 0 0 8px rgba(0, 210, 106, 0); }
    100% { box-shadow: 0 0 0 0 rgba(0, 210, 106, 0); }
  }
`;

const Sidebar = ({ systemStatus = true }) => {
  return (
    <SidebarContainer>
      <Logo>
        <LogoText>
          <LogoIcon>🛡️</LogoIcon>
          ForteFraud
        </LogoText>
        <LogoSubtext>Security Operations Center</LogoSubtext>
      </Logo>

      <NavItems>
        <NavItemLink to="/" end>
          <NavIcon>📡</NavIcon>
          <NavLabel>Live Monitor</NavLabel>
          <NavBadge danger>LIVE</NavBadge>
        </NavItemLink>

        <NavItemLink to="/dashboard">
          <NavIcon>📊</NavIcon>
          <NavLabel>Business Analytics</NavLabel>
        </NavItemLink>

        <NavItemLink to="/settings">
          <NavIcon>⚙️</NavIcon>
          <NavLabel>Admin & MLOps</NavLabel>
        </NavItemLink>
      </NavItems>

      <StatusSection>
        <StatusIndicator active={systemStatus}>
          {systemStatus ? 'System Online' : 'System Offline'}
        </StatusIndicator>
      </StatusSection>
    </SidebarContainer>
  );
};

export default Sidebar;
