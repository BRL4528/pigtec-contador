import styled from 'styled-components/native';

export const Container = styled.View`
 flex: 1;
 background-color: ${({ theme }) => theme.COLORS.GRAY_600};
 align-items: center;
 justify-content: center;
 padding: 24px;
`;

export const TextCount = styled.Text`
 color: ${({ theme }) => theme.COLORS.YELLOW};
 font-size: 74px;
 margin-bottom: 15px;
`;

export const TextFps = styled.Text`
 color: #fff;
`;

export const Button = styled.TouchableOpacity`
 /* flex: 1; */

 height: 56px;
 width: 256px;

 background-color: ${({ theme }) => theme.COLORS.GREEN_700};
 
 border-radius: 6px;

 align-items: center;
 justify-content: center;

 margin-top: 30px;
`;
export const ButtonRed = styled.TouchableOpacity`
 /* flex: 1; */

 height: 56px;
 width: 256px;

 background-color: ${({ theme }) => theme.COLORS.RED};
 
 border-radius: 6px;

 align-items: center;
 justify-content: center;

 margin-top: 30px;

`;

export const Title = styled.Text`
 font-size: ${({ theme }) => theme.FONT_SIZE.MD}px;
 color: ${({ theme }) => theme.COLORS.WHITE};
`;