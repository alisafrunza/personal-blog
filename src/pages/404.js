import React from "react"
import styled from "@emotion/styled"

import Layout from "../components/layout"
import SEO from "../components/seo"

import { Ghost } from "react-kawaii"

const colors = ["#FFD882", "#FDA7DC", "#83D1FB", "#A6E191"]
const color = colors[Math.floor(Math.random() * colors.length)]

const OuterContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 78vh;
`

const NotFoundPage = () => (
  <Layout>
    <SEO title="404: Not found" />
    <OuterContainer>
      <h1>Not Found</h1>
      <p>You just hit a route that doesn&#39;t exist.</p>
      <Ghost size={200} mood="shocked" color={color} />
    </OuterContainer>
  </Layout>
)

export default NotFoundPage
