import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  available: boolean;
  onClick: () => void;
}

function FeatureCard({ title, description, available, onClick }: FeatureCardProps) {
  return (
    <div 
      className={`feature-card ${available ? 'available' : 'unavailable'}`}
      onClick={available ? onClick : undefined}
      role="button"
      tabIndex={available ? 0 : -1}
      aria-disabled={!available}
      onKeyPress={(e) => {
        if (available && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <h3>{title}</h3>
      <p>{description}</p>
      {!available && <span className="coming-soon-badge">Coming Soon</span>}
    </div>
  );
}

interface MainMenuProps {
  onSelectFeature: (feature: 'spec' | 'traffic' | 'deployer') => void;
}

function MainMenu({ onSelectFeature }: MainMenuProps) {
  const handleComingSoon = () => {
    // Show a message that the feature is coming soon
    // This could be enhanced with a toast notification in the future
  };

  return (
    <div className="main-menu">
      <div className="main-menu-header">
        <h1>Infra Genie</h1>
        <p className="subtitle">From idea to deployment</p>
      </div>
      
      <div className="feature-cards">
        <FeatureCard
          title="Spec"
          description="Generate PRDs from your project requirements"
          available={true}
          onClick={() => onSelectFeature('spec')}
        />
        <FeatureCard
          title="Traffic Simulator"
          description="Simulate traffic patterns for your application"
          available={false}
          onClick={handleComingSoon}
        />
        <FeatureCard
          title="Deployer"
          description="Deploy your infrastructure to the cloud"
          available={false}
          onClick={handleComingSoon}
        />
      </div>
    </div>
  );
}

export default MainMenu;
