import styled from 'styled-components';

const StyledButton = styled.button`
  background: ${props => props.theme.containerBg};
  color: ${props => props.theme.text};
  border: 2.5px solid ${props => props.theme.containerBorder};
  border-radius: 6px;
  padding: 0.8rem 2.2rem;
  font-size: 1.08rem;
  font-weight: 700;
  box-shadow: 4px 4px 0 ${props => props.theme.containerBorder};
  cursor: pointer;
  margin-bottom: 1.2rem;
  margin-top: 0.2rem;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-3px) scale(1.06) rotate(-1deg);
    background: ${props => props.theme.buttonHoverBg};
    box-shadow: 8px 8px 0 ${props => props.theme.containerBorder};
  }
  
  &:disabled {
    background-color: ${props => props.theme.inputBg};
    color: ${props => props.theme.text};
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      transform: none;
      box-shadow: 4px 4px 0 ${props => props.theme.containerBorder};
    }
  }

  ${props => props.$variant === 'google' && `
    background: ${props.theme.containerBg};
    color: ${props.theme.text};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    margin-top: 1rem;
    &:hover {
      background: ${props.theme.buttonHoverBg};
      border-color: ${props.theme.containerBorder};
    }
  `}

  ${props => props.$variant === 'link' && `
    background: none;
    border: none;
    color: ${props.theme.text};
    box-shadow: none;
    text-decoration: underline;
    padding: 0;
    font-size: 0.9rem;
    margin: 1rem 0 0 0;
    opacity: 0.8;
    &:hover {
      opacity: 1;
      transform: none;
      box-shadow: none;
      background: none;
    }
  `}
`;

const Button = ({ children, variant, ...props }) => {
  return (
    <StyledButton $variant={variant} {...props}>
      {children}
    </StyledButton>
  );
};

export default Button; 