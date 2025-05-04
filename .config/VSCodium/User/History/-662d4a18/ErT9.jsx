// frontend/src/components/common/MarkdownRenderer.jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

const MarkdownContainer = styled.div`
  font-family: Arial, sans-serif;
  line-height: 1.6;
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }
  
  h2 {
    border-bottom: 1px solid #eaecef;
    padding-bottom: 0.3em;
  }
  
  ul, ol {
    padding-left: 2em;
  }
  
  li {
    margin: 0.25em 0;
  }
`;

const MarkdownRenderer = ({ content }) => {
  return (
    <MarkdownContainer>
      <ReactMarkdown>{content}</ReactMarkdown>
    </MarkdownContainer>
  );
};

export default MarkdownRenderer;