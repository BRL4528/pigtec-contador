import styled from 'styled-components/native';

export const Container = styled.View`
 justify-content: center;
 align-items: center;
 background-color: ${({theme}) => theme.COLOR.GRAY_600};
`;

export const LoadIndicator = styled.ActivityIndicator`

`;