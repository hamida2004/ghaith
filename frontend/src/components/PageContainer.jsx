import React from 'react'
import styled from 'styled-components'
import { colors } from '../style/style'

export const PageContainer = ({children}) => {

    const Container = styled.div`
    padding:80px;
    background-color:${colors.white};
    height:100vh;

    ` 
  return (
    <Container>
        {children}
    </Container>
  )
}
