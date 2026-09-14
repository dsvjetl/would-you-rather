type LogoProps = {
  size?: 'large' | 'small';
};

const Logo = ({ size = 'large' }: LogoProps) => {
  return (
    <h1 className={`logo ${size === 'small' ? 'logo--small' : ''}`}>
      <span className="logo__word logo__word--green">Da li</span>
      <span className="logo__word logo__word--blue">bi</span>
      <span className="logo__word logo__word--green">radije</span>
    </h1>
  );
};

export { Logo };
