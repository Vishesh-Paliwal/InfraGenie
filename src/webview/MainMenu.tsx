import React from 'react';
// Styles imported in App.tsx

interface FeatureCardProps {
  title: string;
  description: string;
  available: boolean;
  onClick: () => void;
}

function FeatureCard({ title, description, available, onClick }: FeatureCardProps) {
  return (
    <div 
      className={`featureCard ${available ? 'available' : 'unavailable'}`}
      onClick={available ? onClick : undefined}
      role="button"
      tabIndex={available ? 0 : -1}
      aria-disabled={!available}
      aria-label={`${title}: ${description}${!available ? ' (Coming Soon)' : ''}`}
      onKeyDown={(e) => {
        if (available && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <h3 aria-hidden="true">{title}</h3>
      <p aria-hidden="true">{description}</p>
      {!available && <span className="comingSoonBadge" aria-hidden="true">Coming Soon</span>}
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
    <div className="mainMenu" role="main">
      <div className="mainMenuHeader">
        <h1>Infra Genie</h1>
        <p className="subtitle">From idea to deployment</p>
      </div>
      
      <nav aria-label="Feature selection">
        <div className="featureCards" role="group" aria-label="Available features">
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
      </nav>
    </div>
  );
}

export default MainMenu;
